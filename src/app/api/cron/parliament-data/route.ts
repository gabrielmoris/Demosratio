import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Logger } from "tslog";

import { getDateString, getFormattedDateForDB } from "@/lib/helpers/dateFormatters";
import { mergeVotesByParty } from "@/lib/helpers/spanishParliamentExtractor/votesPerParty";
import { VotingData } from "@/types/proposal.types";
import { extractParliamentJson } from "@/lib/helpers/spanishParliamentExtractor/getParliamentData";
import { saveProposalToDb, checkProposalExists } from "@/lib/database/spanishParliament/saveProposal";
import { aiPromiseAnalizer } from "@/lib/services/ai/promisesAnaliseAI";
import { setPromiseAnalysis } from "@/lib/database/parties/promises/promises-analysis/setPromisesAnalysis";
import { deleteProposal } from "@/lib/database/spanishParliament/deleteProposal";
import { verifyJWT } from "@/lib/helpers/users/jwt";
import { findUserByName } from "@/lib/database/users/users";

const log = new Logger();

/**
 * Verifies that the request is authorized.
 * Accepts either:
 * 1. CRON_SECRET via Authorization header (for Vercel Cron)
 * 2. Admin JWT session cookie (for Admin Panel UI calls)
 */
async function isAuthorized(req: NextRequest): Promise<boolean> {
 // Check CRON_SECRET from Authorization header
 const authHeader = req.headers.get("authorization");
 const cronSecret = process.env.CRON_SECRET;

 if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
 return true;
 }

 // Check admin JWT session cookie (for Admin Panel calls)
 const session = (await cookies()).get("session")?.value;
 if (session) {
 const payload = verifyJWT(session);
 if (payload?.name) {
 const user = await findUserByName(payload.name);
 if (user?.is_admin) {
 return true;
 }
 }
 }

 return false;
}

// This is our main function that will be used by the Vercel cron job
export async function GET(req: NextRequest) {
 // Verify authorization
 if (!(await isAuthorized(req))) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 log.info("Running parliament data extractor...");

 try {
 // Save last X days in DB
 const daysToCheck = parseInt(process.env.DAYS_TO_CHECK_VOTATIONS || "5", 10);

 for (let i = daysToCheck; i > 0; i--) {
 const dateToCheck = getDateString(i);
 await saveToDb(dateToCheck).catch((e) => log.error("Error saving parliamentdata to DB", dateToCheck, "=>", e));
 }

 log.info("Parliament data extraction completed successfully");
 return NextResponse.json({
 success: true,
 message: "Parliament data extraction completed",
 });
 } catch (error) {
 log.error("Error in parliament data extraction:", error);
 return NextResponse.json(
 {
 success: false,
 message: "Parliament data extraction failed",
 },
 { status: 500 },
 );
 }
}

async function saveToDb(day: string) {
 const extractedParliamentData = await extractParliamentJson(day);

 for (const votation of extractedParliamentData) {
 const { textoExpediente: expedient_text } = votation.informacion;

 const existingProposal = await checkProposalExists(expedient_text);

 if (existingProposal) {
 log.warn(`Proposal with expedient_text "${expedient_text}" already exists. Skipping.`);
 continue;
 }

 // Get the important information
 const { sesion: session, fecha: date, titulo: title } = votation.informacion;

 const {
 presentes: parliament_presence,
 afavor: votes_for,
 enContra: votes_against,
 abstenciones: abstentions,
 noVotan: no_vote,
 asentimiento: assent,
 } = votation.totales;

 const votes_parties_json = mergeVotesByParty(votation.votaciones);
 const isAccepted = assent === "Sí" ? true : false;

 const proposalData: VotingData = {
 session,
 date: getFormattedDateForDB(date),
 title,
 url: `https://www.congreso.es/es/opendata/votaciones?p_p_id=votaciones&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&targetLegislatura=XV&targetDate=${day}`,
 expedient_text,
 parliament_presence,
 votes_for,
 votes_against,
 abstentions,
 no_vote,
 votes_parties_json,
 assent: isAccepted,
 };

 try {
 const savedProposal = await saveProposalToDb(proposalData);

 if (!savedProposal) {
 throw new Error(`Failed to save proposal: ${title}`);
 }

 // Run AI analysis for new proposals
 const analysisArr = await aiPromiseAnalizer(proposalData);
 log.info("SAVING ", day, " ", savedProposal.id);
 log.info("gemini analyse => ", analysisArr.length, analysisArr[0]);

 if (analysisArr.length > 0) {
 for (const analysis of analysisArr) {
 const result = await setPromiseAnalysis(analysis, savedProposal.id);

 if (result && "error" in result) {
 log.error("Promise analysis failed, deleting proposal:", result.error);

 await deleteProposal(savedProposal.id);

 throw new Error(`Promise analysis failed: ${result.error}`);
 }
 }
 }
 } catch (error) {
 log.error(`Failed to save proposal ${day} "${title}":`, error);
 throw new Error(`Failed to save proposal ${day} "${title}"`);
 }
 }
}
