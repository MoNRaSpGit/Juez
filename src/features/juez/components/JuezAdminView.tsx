import { Assignment, AvailabilityEntry, Match, MatchFormState, Referee, RefereeRole } from "../juez.types";
import { JuezTeam } from "../juez.teams.types";
import { DesignationModal } from "./DesignationModal";
import { MatchList } from "./MatchList";
import { PublishMatchForm } from "./PublishMatchForm";
import { RefereeEarningsPanel } from "./RefereeEarningsPanel";

type JuezAdminViewProps = {
  matches: Match[];
  referees: Referee[];
  availability: AvailabilityEntry[];
  assignments: Assignment[];
  teams: JuezTeam[];
  selectedMatchId: string;
  matchForm: MatchFormState;
  designationDraft: Record<RefereeRole, string>;
  redesigningMatchId: string | null;
  currentTournament: string;
  isEditingTournament: boolean;
  tournamentDraft: string;
  onSelectMatch: (matchId: string) => void;
  onChangeMatchForm: (field: keyof MatchFormState, value: string) => void;
  onCreateMatch: () => void;
  onDesignationChange: (role: RefereeRole, refereeId: string) => void;
  onConfirmDesignation: () => void;
  onResetAssignment: (matchId: string) => void;
  onStartRedesignation: (matchId: string) => void;
  onStartTournamentEdit: () => void;
  onTournamentDraftChange: (value: string) => void;
  onSaveTournament: () => void;
};

export function JuezAdminView({
  matches,
  referees,
  availability,
  assignments,
  teams,
  selectedMatchId,
  matchForm,
  designationDraft,
  redesigningMatchId,
  currentTournament,
  isEditingTournament,
  tournamentDraft,
  onSelectMatch,
  onChangeMatchForm,
  onCreateMatch,
  onDesignationChange,
  onConfirmDesignation,
  onResetAssignment,
  onStartRedesignation,
  onStartTournamentEdit,
  onTournamentDraftChange,
  onSaveTournament
}: JuezAdminViewProps) {
  const selectedMatch = matches.find((match) => match.id === selectedMatchId) ?? null;

  return (
    <section className="juez-layout-grid">
      <PublishMatchForm
        teams={teams}
        matchForm={matchForm}
        currentTournament={currentTournament}
        isEditingTournament={isEditingTournament}
        tournamentDraft={tournamentDraft}
        onChangeMatchForm={onChangeMatchForm}
        onCreateMatch={onCreateMatch}
        onStartTournamentEdit={onStartTournamentEdit}
        onTournamentDraftChange={onTournamentDraftChange}
        onSaveTournament={onSaveTournament}
      />

      <MatchList
        matches={matches}
        selectedMatchId={selectedMatchId}
        redesigningMatchId={redesigningMatchId}
        onSelectMatch={onSelectMatch}
      />

      <RefereeEarningsPanel referees={referees} assignments={assignments} matches={matches} />

      {selectedMatch ? (
        <DesignationModal
          match={selectedMatch}
          referees={referees}
          availability={availability}
          assignments={assignments}
          designationDraft={designationDraft}
          isRedesignating={redesigningMatchId === selectedMatch.id}
          onDesignationChange={onDesignationChange}
          onConfirmDesignation={onConfirmDesignation}
          onResetAssignment={onResetAssignment}
          onStartRedesignation={onStartRedesignation}
          onClose={() => onSelectMatch("")}
        />
      ) : null}
    </section>
  );
}
