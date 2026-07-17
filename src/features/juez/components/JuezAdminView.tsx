import { Assignment, AvailabilityEntry, Match, MatchFormState, Referee, RefereeRole } from "../juez.types";
import { DesignationModal } from "./DesignationModal";
import { MatchList } from "./MatchList";
import { PublishMatchForm } from "./PublishMatchForm";
import { RefereeEarningsPanel } from "./RefereeEarningsPanel";

type JuezAdminViewProps = {
  matches: Match[];
  referees: Referee[];
  availability: AvailabilityEntry[];
  assignments: Assignment[];
  selectedMatchId: string;
  matchForm: MatchFormState;
  designationDraft: Record<RefereeRole, string>;
  currentTournament: string;
  isEditingTournament: boolean;
  tournamentDraft: string;
  onSelectMatch: (matchId: string) => void;
  onChangeMatchForm: (field: keyof MatchFormState, value: string) => void;
  onCreateMatch: () => void;
  onDesignationChange: (role: RefereeRole, refereeId: string) => void;
  onConfirmDesignation: () => void;
  onStartTournamentEdit: () => void;
  onTournamentDraftChange: (value: string) => void;
  onSaveTournament: () => void;
};

export function JuezAdminView({
  matches,
  referees,
  availability,
  assignments,
  selectedMatchId,
  matchForm,
  designationDraft,
  currentTournament,
  isEditingTournament,
  tournamentDraft,
  onSelectMatch,
  onChangeMatchForm,
  onCreateMatch,
  onDesignationChange,
  onConfirmDesignation,
  onStartTournamentEdit,
  onTournamentDraftChange,
  onSaveTournament
}: JuezAdminViewProps) {
  const selectedMatch = matches.find((match) => match.id === selectedMatchId) ?? null;

  return (
    <section className="juez-layout-grid">
      <PublishMatchForm
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

      <MatchList matches={matches} selectedMatchId={selectedMatchId} onSelectMatch={onSelectMatch} />

      <RefereeEarningsPanel referees={referees} assignments={assignments} matches={matches} />

      {selectedMatch ? (
        <DesignationModal
          match={selectedMatch}
          referees={referees}
          availability={availability}
          assignments={assignments}
          designationDraft={designationDraft}
          onDesignationChange={onDesignationChange}
          onConfirmDesignation={onConfirmDesignation}
          onClose={() => onSelectMatch("")}
        />
      ) : null}
    </section>
  );
}
