export type JuezPlayerDivision = "A" | "B";
export type JuezPlayerSex = "masculino" | "femenino";

export type JuezPlayer = {
  id: number;
  team: string;
  division: JuezPlayerDivision;
  sex: JuezPlayerSex;
  name: string;
  expiryDate: string;
  cedula: string | null;
  birthDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type JuezPlayerFormState = {
  name: string;
  expiryDate: string;
  cedula: string;
  birthDate: string;
};

export const INITIAL_JUEZ_PLAYER_FORM: JuezPlayerFormState = {
  name: "",
  expiryDate: "",
  cedula: "",
  birthDate: ""
};
