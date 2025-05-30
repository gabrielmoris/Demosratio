

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."campaigns" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "year" bigint NOT NULL,
    "party_id" bigint NOT NULL,
    "campaign_pdf_url" character varying
);


ALTER TABLE "public"."campaigns" OWNER TO "postgres";


ALTER TABLE "public"."campaigns" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."campaigns_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."parties" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "logo_url" "text"
);


ALTER TABLE "public"."parties" OWNER TO "postgres";


ALTER TABLE "public"."parties" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."parties_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."promises" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "campaign_id" bigint,
    "subject_id" bigint,
    "promise" "text" NOT NULL,
    "party_id" bigint NOT NULL
);


ALTER TABLE "public"."promises" OWNER TO "postgres";


ALTER TABLE "public"."promises" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."promises_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."promises_readiness_index" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "campaign_id" bigint NOT NULL,
    "user_id" bigint NOT NULL,
    "readiness_score" bigint
);


ALTER TABLE "public"."promises_readiness_index" OWNER TO "postgres";


ALTER TABLE "public"."promises_readiness_index" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."promises_readiness_index_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."proposal_dislikes" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "proposal_id" bigint NOT NULL,
    "user_id" bigint NOT NULL
);


ALTER TABLE "public"."proposal_dislikes" OWNER TO "postgres";


COMMENT ON TABLE "public"."proposal_dislikes" IS 'User dislikes related with the table Proposals';



ALTER TABLE "public"."proposal_dislikes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."proposal_dislikes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."proposal_likes" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "proposal_id" bigint NOT NULL,
    "user_id" bigint NOT NULL
);


ALTER TABLE "public"."proposal_likes" OWNER TO "postgres";


COMMENT ON TABLE "public"."proposal_likes" IS 'Likes related to Proposals table';



ALTER TABLE "public"."proposal_likes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."proposal_likes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."proposals" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "url" "text" NOT NULL,
    "session" bigint DEFAULT '0'::bigint NOT NULL,
    "expedient_text" "text" NOT NULL,
    "votes_parties_json" "jsonb" NOT NULL,
    "parliament_presence" bigint NOT NULL,
    "votes_for" bigint NOT NULL,
    "abstentions" bigint NOT NULL,
    "votes_against" bigint NOT NULL,
    "no_vote" bigint NOT NULL,
    "assent" boolean,
    "date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "BOE" "text"
);


ALTER TABLE "public"."proposals" OWNER TO "postgres";


COMMENT ON TABLE "public"."proposals" IS 'Votes that the Spanish Parties did in the Congress';



ALTER TABLE "public"."proposals" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."proposals_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."subjects" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "description" character varying
);


ALTER TABLE "public"."subjects" OWNER TO "postgres";


ALTER TABLE "public"."subjects" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."subjects_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_devices" (
    "id" bigint NOT NULL,
    "user_id" bigint,
    "device_hash" character varying NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_devices" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_devices" IS 'Devices linked to an account';



ALTER TABLE "public"."user_devices" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_devices_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" bigint NOT NULL,
    "register_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "password" "text",
    "is_admin" boolean DEFAULT false
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'User MAnagement';



ALTER TABLE "public"."users" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."parties"
    ADD CONSTRAINT "parties_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."parties"
    ADD CONSTRAINT "parties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promises"
    ADD CONSTRAINT "promises_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promises_readiness_index"
    ADD CONSTRAINT "promises_readiness_index_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."proposal_dislikes"
    ADD CONSTRAINT "proposal_dislikes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."proposal_likes"
    ADD CONSTRAINT "proposal_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."proposals"
    ADD CONSTRAINT "proposals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_devices"
    ADD CONSTRAINT "user_devices_device_hash_key" UNIQUE ("device_hash");



ALTER TABLE ONLY "public"."user_devices"
    ADD CONSTRAINT "user_devices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id");



ALTER TABLE ONLY "public"."promises"
    ADD CONSTRAINT "promises_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id");



ALTER TABLE ONLY "public"."promises"
    ADD CONSTRAINT "promises_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id");



ALTER TABLE ONLY "public"."promises_readiness_index"
    ADD CONSTRAINT "promises_readiness_index_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id");



ALTER TABLE ONLY "public"."promises_readiness_index"
    ADD CONSTRAINT "promises_readiness_index_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."promises"
    ADD CONSTRAINT "promises_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id");



ALTER TABLE ONLY "public"."proposal_dislikes"
    ADD CONSTRAINT "proposal_dislikes_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proposal_dislikes"
    ADD CONSTRAINT "proposal_dislikes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proposal_likes"
    ADD CONSTRAINT "proposal_likes_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proposal_likes"
    ADD CONSTRAINT "proposal_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_devices"
    ADD CONSTRAINT "user_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE "public"."campaigns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."parties" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promises" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promises_readiness_index" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."proposal_dislikes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."proposal_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."proposals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subjects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_devices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



































































































































































































GRANT ALL ON TABLE "public"."campaigns" TO "anon";
GRANT ALL ON TABLE "public"."campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."campaigns" TO "service_role";



GRANT ALL ON SEQUENCE "public"."campaigns_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."campaigns_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."campaigns_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."parties" TO "anon";
GRANT ALL ON TABLE "public"."parties" TO "authenticated";
GRANT ALL ON TABLE "public"."parties" TO "service_role";



GRANT ALL ON SEQUENCE "public"."parties_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."parties_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."parties_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."promises" TO "anon";
GRANT ALL ON TABLE "public"."promises" TO "authenticated";
GRANT ALL ON TABLE "public"."promises" TO "service_role";



GRANT ALL ON SEQUENCE "public"."promises_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."promises_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."promises_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."promises_readiness_index" TO "anon";
GRANT ALL ON TABLE "public"."promises_readiness_index" TO "authenticated";
GRANT ALL ON TABLE "public"."promises_readiness_index" TO "service_role";



GRANT ALL ON SEQUENCE "public"."promises_readiness_index_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."promises_readiness_index_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."promises_readiness_index_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."proposal_dislikes" TO "anon";
GRANT ALL ON TABLE "public"."proposal_dislikes" TO "authenticated";
GRANT ALL ON TABLE "public"."proposal_dislikes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."proposal_dislikes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."proposal_dislikes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."proposal_dislikes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."proposal_likes" TO "anon";
GRANT ALL ON TABLE "public"."proposal_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."proposal_likes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."proposal_likes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."proposal_likes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."proposal_likes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."proposals" TO "anon";
GRANT ALL ON TABLE "public"."proposals" TO "authenticated";
GRANT ALL ON TABLE "public"."proposals" TO "service_role";



GRANT ALL ON SEQUENCE "public"."proposals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."proposals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."proposals_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."subjects" TO "anon";
GRANT ALL ON TABLE "public"."subjects" TO "authenticated";
GRANT ALL ON TABLE "public"."subjects" TO "service_role";



GRANT ALL ON SEQUENCE "public"."subjects_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."subjects_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."subjects_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_devices" TO "anon";
GRANT ALL ON TABLE "public"."user_devices" TO "authenticated";
GRANT ALL ON TABLE "public"."user_devices" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_devices_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_devices_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_devices_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
