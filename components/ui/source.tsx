import { FAQ_URL } from '@/lib/seo';
export function Source({ questions = '9', page = 2 }: { questions?: string; page?: number }) {
  return (
    <a className="source-link" href={`${FAQ_URL}#page=${page}`} target="_blank" rel="noreferrer">
      GRA FAQ, Q{questions}, page {page}
    </a>
  );
}
