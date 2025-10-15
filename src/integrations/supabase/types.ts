export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      donaciones: {
        Row: {
          cantidad_ml: number
          centro: string | null
          documento_donante: string
          estado: string | null
          fecha_donacion: string
          fecha_registro: string | null
          id: string
          observaciones: string | null
        }
        Insert: {
          cantidad_ml: number
          centro?: string | null
          documento_donante: string
          estado?: string | null
          fecha_donacion: string
          fecha_registro?: string | null
          id?: string
          observaciones?: string | null
        }
        Update: {
          cantidad_ml?: number
          centro?: string | null
          documento_donante?: string
          estado?: string | null
          fecha_donacion?: string
          fecha_registro?: string | null
          id?: string
          observaciones?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donaciones_documento_donante_fkey"
            columns: ["documento_donante"]
            isOneToOne: false
            referencedRelation: "donantes"
            referencedColumns: ["documento"]
          },
        ]
      }
      donantes: {
        Row: {
          correo: string
          documento: string
          fecha_registro: string | null
          nombre: string
          tipo_sangre: string | null
          user_id: string | null
        }
        Insert: {
          correo: string
          documento: string
          fecha_registro?: string | null
          nombre: string
          tipo_sangre?: string | null
          user_id?: string | null
        }
        Update: {
          correo?: string
          documento?: string
          fecha_registro?: string | null
          nombre?: string
          tipo_sangre?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      entidades: {
        Row: {
          correo: string
          fecha_registro: string | null
          id: string
          nombre: string
          user_id: string | null
        }
        Insert: {
          correo: string
          fecha_registro?: string | null
          id?: string
          nombre: string
          user_id?: string | null
        }
        Update: {
          correo?: string
          fecha_registro?: string | null
          id?: string
          nombre?: string
          user_id?: string | null
        }
        Relationships: []
      }
      historias_clinicas: {
        Row: {
          altura: number | null
          documento_donante: string
          edad: number | null
          enfermedades: string | null
          estado: string | null
          fecha_envio: string | null
          fecha_revision: string | null
          fecha_ultima_donacion: string | null
          habitos_personales: string | null
          id: string
          medicamentos: string | null
          observaciones: string | null
          observaciones_medicas: string | null
          peso: number | null
          transfusiones_previas: boolean | null
        }
        Insert: {
          altura?: number | null
          documento_donante: string
          edad?: number | null
          enfermedades?: string | null
          estado?: string | null
          fecha_envio?: string | null
          fecha_revision?: string | null
          fecha_ultima_donacion?: string | null
          habitos_personales?: string | null
          id?: string
          medicamentos?: string | null
          observaciones?: string | null
          observaciones_medicas?: string | null
          peso?: number | null
          transfusiones_previas?: boolean | null
        }
        Update: {
          altura?: number | null
          documento_donante?: string
          edad?: number | null
          enfermedades?: string | null
          estado?: string | null
          fecha_envio?: string | null
          fecha_revision?: string | null
          fecha_ultima_donacion?: string | null
          habitos_personales?: string | null
          id?: string
          medicamentos?: string | null
          observaciones?: string | null
          observaciones_medicas?: string | null
          peso?: number | null
          transfusiones_previas?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "historias_clinicas_documento_donante_fkey"
            columns: ["documento_donante"]
            isOneToOne: false
            referencedRelation: "donantes"
            referencedColumns: ["documento"]
          },
        ]
      }
      solicitudes: {
        Row: {
          cantidad_ml: number
          entidad_id: string | null
          estado: string | null
          fecha_requerida: string
          fecha_solicitud: string | null
          id: string
          observaciones: string | null
          tipo_sangre: string
          urgencia: string
        }
        Insert: {
          cantidad_ml: number
          entidad_id?: string | null
          estado?: string | null
          fecha_requerida: string
          fecha_solicitud?: string | null
          id?: string
          observaciones?: string | null
          tipo_sangre: string
          urgencia: string
        }
        Update: {
          cantidad_ml?: number
          entidad_id?: string | null
          estado?: string | null
          fecha_requerida?: string
          fecha_solicitud?: string | null
          id?: string
          observaciones?: string | null
          tipo_sangre?: string
          urgencia?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitudes_entidad_id_fkey"
            columns: ["entidad_id"]
            isOneToOne: false
            referencedRelation: "entidades"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
