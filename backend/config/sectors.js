/**
 * Biotech and Life Sciences Sector Configuration
 * Defines related sectors, industries, and keywords for comprehensive filtering
 */

// Primary biotech keywords (core focus)
export const PRIMARY_BIOTECH_KEYWORDS = [
  'biotech',
  'biotechnology',
  'biopharmaceutical',
  'biopharma',
  'genetic engineering',
  'gene therapy',
  'cell therapy',
  'rna',
  'mrna',
  'crispr',
  'genomics',
  'gene editing'
]

// Adjacent life sciences keywords
export const LIFE_SCIENCES_KEYWORDS = [
  'pharmaceutical',
  'pharma',
  'life sciences',
  'therapeutics',
  'diagnostics',
  'medical device',
  'precision medicine',
  'clinical research',
  'bioinformatics',
  'immunology',
  'oncology'
]

// Enabling infrastructure keywords
export const INFRASTRUCTURE_KEYWORDS = [
  'laboratory equipment',
  'research tools',
  'lab equipment',
  'cro',
  'contract research',
  'health data',
  'healthcare ai',
  'medical ai',
  'digital health'
]

// All keywords combined
export const ALL_KEYWORDS = [
  ...PRIMARY_BIOTECH_KEYWORDS,
  ...LIFE_SCIENCES_KEYWORDS,
  ...INFRASTRUCTURE_KEYWORDS
]

/**
 * Sector taxonomy - maps broader categories to specific keywords
 */
export const SECTOR_TAXONOMY = {
  'Primary Biotech': {
    keywords: PRIMARY_BIOTECH_KEYWORDS,
    color: '#9b59b6'
  },
  'Life Sciences': {
    keywords: LIFE_SCIENCES_KEYWORDS,
    color: '#3498db'
  },
  'Healthcare Infrastructure': {
    keywords: INFRASTRUCTURE_KEYWORDS,
    color: '#16a085'
  }
}

/**
 * Check if text matches any keyword (case-insensitive, partial match)
 * @param {string} text - Text to search in
 * @param {Array<string>} keywords - Keywords to search for
 * @returns {Array<string>} - Matched keywords
 */
export function findMatchingKeywords(text, keywords) {
  if (!text) return []
  
  const lowerText = text.toLowerCase()
  return keywords.filter(keyword => 
    lowerText.includes(keyword.toLowerCase())
  )
}

/**
 * Determine primary and secondary sectors for a company
 * @param {Object} company - Company data
 * @returns {Object} - { primarySector, secondarySectors, matchReasons }
 */
export function categorizeSectors(company) {
  const searchText = [
    company.longname,
    company.shortname,
    company.industryDisp,
    company.sectorDisp
  ].join(' ')

  const primaryMatches = findMatchingKeywords(searchText, PRIMARY_BIOTECH_KEYWORDS)
  const lifeSciences = findMatchingKeywords(searchText, LIFE_SCIENCES_KEYWORDS)
  const infrastructure = findMatchingKeywords(searchText, INFRASTRUCTURE_KEYWORDS)

  let primarySector = 'Other'
  const secondarySectors = []
  const matchReasons = []

  // Determine primary sector (highest priority wins)
  if (primaryMatches.length > 0) {
    primarySector = 'Primary Biotech'
    matchReasons.push(`Primary biotech match: ${primaryMatches.join(', ')}`)
  } else if (lifeSciences.length > 0) {
    primarySector = 'Life Sciences'
    matchReasons.push(`Life sciences match: ${lifeSciences.join(', ')}`)
  } else if (infrastructure.length > 0) {
    primarySector = 'Healthcare Infrastructure'
    matchReasons.push(`Infrastructure match: ${infrastructure.join(', ')}`)
  }

  // Add secondary sectors
  if (primarySector !== 'Life Sciences' && lifeSciences.length > 0) {
    secondarySectors.push('Life Sciences')
  }
  if (primarySector !== 'Healthcare Infrastructure' && infrastructure.length > 0) {
    secondarySectors.push('Healthcare Infrastructure')
  }

  // Add match reasons based on field
  if (company.industryDisp && findMatchingKeywords(company.industryDisp, ALL_KEYWORDS).length > 0) {
    matchReasons.push('industry match')
  }
  if (company.sectorDisp && findMatchingKeywords(company.sectorDisp, ALL_KEYWORDS).length > 0) {
    matchReasons.push('sector match')
  }

  return {
    primarySector,
    secondarySectors,
    matchReasons
  }
}
