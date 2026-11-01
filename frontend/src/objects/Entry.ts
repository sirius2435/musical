export interface Entry {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    summary: string;
    body: string;
    category: string;
    year: number;
    eraId: string | null;
    source: string;
    image: string;
}
