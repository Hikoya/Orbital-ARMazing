import { AssetFetch } from 'types/asset';
import { EventFetch } from 'types/event';
import { Statistic } from 'types/dashboard';
import { QuizFetch } from 'types/quiz';

export type Result = {
  status: boolean;
  error: string | null;
  msg: string | AssetFetch[] | EventFetch[] | Statistic | QuizFetch[];
};
