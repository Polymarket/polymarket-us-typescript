import type { Amount } from './common';
import type { Subject, Team } from './markets';
import type { OutcomeSide } from './orders';

export type ComboLegState =
  | 'COMBO_LEG_STATE_UNSPECIFIED'
  | 'COMBO_LEG_STATE_PENDING'
  | 'COMBO_LEG_STATE_WON'
  | 'COMBO_LEG_STATE_LOST'
  | 'COMBO_LEG_STATE_INDETERMINATE';

export interface ComboSettlement {
  settlementPrice: Amount;
  settlementSetTime: string | null;
}

export interface ComboLegDetail {
  slug: string;
  icon: string;
  title: string;
  outcome: string;
  eventSlug: string;
  teamId?: number;
  team?: Team;
  subject?: Subject;
  eventId: string;
  outcomeSide: OutcomeSide;
  eventGroupTitle: string;
  eventStartTime: string | null;
  live: boolean;
  indicativePrice: Amount | null;
  settlement?: ComboSettlement;
  state: ComboLegState;
}
