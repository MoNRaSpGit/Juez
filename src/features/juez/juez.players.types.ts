export type JuezPlayerDivision = "A" | "B";
export type JuezPlayerSex = "masculino" | "femenino";

export type JuezPlayer = {
  id: number;
  team: string;
  division: JuezPlayerDivision;
  sex: JuezPlayerSex;
  name: string;
  lastName: string;
  expiryDate: string;
  cedula: string | null;
  phone: string | null;
  birthDate: string | null;
  hasPhoto: boolean;
  createdAt: string;
  updatedAt: string;
};

export type JuezPlayerFormState = {
  name: string;
  lastName: string;
  expiryDate: string;
  cedula: string;
  phone: string;
  birthDate: string;
  photoDataUrl: string;
};

export const INITIAL_JUEZ_PLAYER_FORM: JuezPlayerFormState = {
  name: "",
  lastName: "",
  expiryDate: "",
  cedula: "",
  phone: "",
  birthDate: "",
  photoDataUrl: ""
};
