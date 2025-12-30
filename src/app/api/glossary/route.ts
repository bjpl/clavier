import { NextRequest, NextResponse } from 'next/server';

// In a real implementation, this would be stored in the database
// For now, using a static glossary
const GLOSSARY: Record<string, {
  term: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
}> = {
  'tonic': {
    term: 'Tonic',
    definition: 'The first note of a scale, the home note or key center of a piece.',
    category: 'harmony',
    relatedTerms: ['dominant', 'subdominant', 'key'],
  },
  'dominant': {
    term: 'Dominant',
    definition: 'The fifth note of a scale, which has a strong pull toward the tonic.',
    category: 'harmony',
    relatedTerms: ['tonic', 'leading-tone', 'cadence'],
  },
  'fugue': {
    term: 'Fugue',
    definition: 'A contrapuntal composition in which a short melody (subject) is introduced and then developed through various voices.',
    category: 'form',
    relatedTerms: ['subject', 'answer', 'countersubject', 'stretto'],
  },
  'subject': {
    term: 'Subject',
    definition: 'The main theme of a fugue, typically introduced at the beginning.',
    category: 'fugue',
    relatedTerms: ['fugue', 'answer', 'countersubject'],
  },
  'answer': {
    term: 'Answer',
    definition: 'The transposed version of the fugue subject, typically at the dominant.',
    category: 'fugue',
    relatedTerms: ['subject', 'fugue', 'tonal-answer', 'real-answer'],
  },
  'cadence': {
    term: 'Cadence',
    definition: 'A harmonic progression that creates a sense of resolution or pause.',
    category: 'harmony',
    relatedTerms: ['authentic-cadence', 'plagal-cadence', 'deceptive-cadence'],
  },
  'counterpoint': {
    term: 'Counterpoint',
    definition: 'The art of combining two or more melodic lines in a harmonically interdependent way.',
    category: 'technique',
    relatedTerms: ['polyphony', 'fugue', 'canon'],
  },
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    let terms = Object.values(GLOSSARY);

    if (search) {
      const query = search.toLowerCase();
      terms = terms.filter(
        t =>
          t.term.toLowerCase().includes(query) ||
          t.definition.toLowerCase().includes(query)
      );
    }

    if (category) {
      terms = terms.filter(t => t.category === category);
    }

    // Sort alphabetically
    terms.sort((a, b) => a.term.localeCompare(b.term));

    return NextResponse.json({
      terms,
      total: terms.length,
    });
  } catch (error) {
    console.error('Error fetching glossary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch glossary' },
      { status: 500 }
    );
  }
}
