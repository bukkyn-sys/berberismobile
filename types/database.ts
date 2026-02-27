// Auto-generated types for Berberis Capital Supabase schema
// Update this file after running: npx supabase gen types typescript

export type UserRole = "mentee" | "mentor" | "admin";
export type UserTier = "free" | "standard" | "ultra";
export type CareerStage = "university" | "graduate" | "analyst" | "associate_plus";
export type SessionType = "group" | "one_to_one";
export type SessionStatus = "scheduled" | "completed" | "cancelled" | "no_show";
export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "trialing";
export type QuestionCategory = "accounting" | "dcf" | "lbo" | "comps" | "market" | "behavioural";
export type QuestionDifficulty = "uni_spring" | "graduate" | "analyst" | "associate_plus";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          tier: UserTier;
          push_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      profiles: {
        Row: {
          user_id: string;
          career_stage: CareerStage | null;
          current_firm: string | null;
          job_title: string | null;
          target_role: string | null;
          target_division: string | null;
          university: string | null;
          year_of_study: number | null;
          goals: string | null;
          bio: string | null;
          avatar_url: string | null;
          is_founding_member: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], never>;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      mentors: {
        Row: {
          user_id: string;
          firm: string;
          seniority: string;
          expertise_areas: string[];
          availability: string | null;
          bio: string | null;
          rating_avg: number;
          total_hours: number;
          session_count: number;
          is_top_mentor: boolean;
          top_mentor_since: string | null;
          is_founding_mentor: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["mentors"]["Row"], never>;
        Update: Partial<Database["public"]["Tables"]["mentors"]["Insert"]>;
      };
      mentor_sessions: {
        Row: {
          id: string;
          mentor_id: string;
          mentee_ids: string[];
          session_type: SessionType;
          scheduled_at: string;
          duration_mins: number;
          status: SessionStatus;
          cal_event_id: string | null;
          notes: string | null;
          action_items: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["mentor_sessions"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["mentor_sessions"]["Insert"]>;
      };
      mentor_ratings: {
        Row: {
          id: string;
          session_id: string;
          mentor_id: string;
          mentee_id: string;
          rating: number;
          feedback: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["mentor_ratings"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["mentor_ratings"]["Insert"]>;
      };
      interview_questions: {
        Row: {
          id: string;
          category: QuestionCategory;
          difficulty: QuestionDifficulty;
          question_text: string;
          model_answer: string;
          hints: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["interview_questions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["interview_questions"]["Insert"]>;
      };
      interview_attempts: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          user_answer: string | null;
          score: number | null;
          time_taken_seconds: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["interview_attempts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["interview_attempts"]["Insert"]>;
      };
      flashcard_decks: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          is_premium: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["flashcard_decks"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["flashcard_decks"]["Insert"]>;
      };
      flashcards: {
        Row: {
          id: string;
          deck_id: string;
          front: string;
          back: string;
          difficulty: number;
        };
        Insert: Omit<Database["public"]["Tables"]["flashcards"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["flashcards"]["Insert"]>;
      };
      user_flashcard_progress: {
        Row: {
          user_id: string;
          flashcard_id: string;
          ease_factor: number;
          interval_days: number;
          repetitions: number;
          next_review_at: string;
        };
        Insert: Database["public"]["Tables"]["user_flashcard_progress"]["Row"];
        Update: Partial<Database["public"]["Tables"]["user_flashcard_progress"]["Insert"]>;
      };
      lateral_moves: {
        Row: {
          id: string;
          person_name: string;
          from_firm: string;
          from_role: string;
          to_firm: string;
          to_role: string;
          division: string | null;
          seniority: string | null;
          date_moved: string | null;
          source: string | null;
          is_verified: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["lateral_moves"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["lateral_moves"]["Insert"]>;
      };
      subscriptions: {
        Row: {
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          tier: UserTier;
          status: SubscriptionStatus;
          current_period_start: string | null;
          current_period_end: string | null;
          is_annual: boolean;
          is_student: boolean;
          is_founding: boolean;
        };
        Insert: Database["public"]["Tables"]["subscriptions"]["Row"];
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          session_id: string | null;
          content: string;
          created_at: string;
          read_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
      session_caps: {
        Row: {
          user_id: string;
          billing_period_start: string;
          sessions_used: number;
          sessions_limit: number;
        };
        Insert: Database["public"]["Tables"]["session_caps"]["Row"];
        Update: Partial<Database["public"]["Tables"]["session_caps"]["Insert"]>;
      };
    };
  };
};
