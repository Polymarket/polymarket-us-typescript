export interface Sport {
  id: string;
  name: string;
  slug: string;
  leagues?: League[];
}

export interface League {
  id: string;
  name: string;
  slug: string;
}

export interface SportsTeam {
  id: number;
  name: string;
  abbreviation?: string;
  league?: string;
  record?: string;
  logo?: string;
  alias?: string;
  safeName?: string;
  homeIcon?: string;
  awayIcon?: string;
  colorPrimary?: string;
  providerIds?: SportsTeamProvider[];
}

export interface SportsTeamProvider {
  provider: string;
  id: string;
}

export interface GetSportsResponse {
  sports: Sport[];
}

export interface GetSportsTeamsParams {
  teamIds?: string[];
  provider?: string;
  league?: string;
}

export interface GetSportsTeamsResponse {
  teams: Record<string, SportsTeam>;
}
