import { fetchPartyPromises } from "@/lib/database/parties/promises/getPartyPromises";
import { NextRequest, NextResponse } from "next/server";
import { Logger } from "tslog";

const log = new Logger();

export async function GET(request: { url: string | URL }) {
  try {
    const { searchParams } = new URL(request.url); // Extract search params
    const party = searchParams.get("party");
    const year = Number(searchParams.get("year"));

    if (!party || !year || isNaN(year))
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });

    const { promises } = await fetchPartyPromises(party, year);

    return NextResponse.json({ promises });
  } catch (error) {
    log.error("Error encoding data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Getting Parties data failed",
        error: String(error),
      },
      { status: 200 }
    );
  }
}

// export async function POST(req: NextRequest) {
//   const { promise, subject, campaign_year, party } = await req.json();

//   if (!promise || !subject || !campaign_year || !party) {
//     return NextResponse.json({ error: "Bad Request" }, { status: 400 });
//   }

//   try {
//     const campaign = await getCampaign(party, campaign_year);
//     const { id } = await savePromise(promise);
//     return NextResponse.json({ id }, { status: 201 });
//   } catch (error) {
//     log.error("Error encoding data:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Saving Parties data failed",
//         error: String(error),
//       },
//       { status: 200 }
//     );
//   }
// }

// export async function DELETE(req: NextRequest) {
//   const { name } = await req.json();

//   if (!name) {
//     return NextResponse.json({ error: "Bad Request" }, { status: 400 });
//   }

//   try {
//     const { id } = await deleteSubject(name);

//     return NextResponse.json({ id }, { status: 201 });
//   } catch (error) {
//     log.error("Error encoding data:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Saving Parties data failed",
//         error: String(error),
//       },
//       { status: 200 }
//     );
//   }
// }
