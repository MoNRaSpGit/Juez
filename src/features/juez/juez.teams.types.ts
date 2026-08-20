import { JuezPlayerDivision, JuezPlayerSex } from "./juez.players.types";

export type JuezTeam = {
  id: number;
  name: string;
  division: JuezPlayerDivision;
  sex: JuezPlayerSex;
  createdAt: string;
  updatedAt: string;
};

export type JuezTeamFormState = {
  name: string;
  division: JuezPlayerDivision;
  sex: JuezPlayerSex;
};

export const INITIAL_JUEZ_TEAM_FORM: JuezTeamFormState = {
  name: "",
  division: "A",
  sex: "masculino"
};
