import { db } from './index'
import { accommodations } from './schema'

const accommodationsList = [
  'Spell check or external spell check device',
  'Text-to-Speech (Text Only & Graphics)',
  'Graphic Organizer',
  'Small group',
  'Reduced distractions to self and others',
  'Math tools including Calculator on non calculator sections',
  'Extended time 1.5x',
  'Allow use of organizational aids',
  'Repeat or paraphrase information',
  'Allow use of highlighters',
  'Provide student with a copy of student/teacher notes',
  'Chunking of texts',
  'Computer to use as a spelling aid',
  'Strategies to initiate and sustain attention',
  'Redirect student',
  'Specified area/seating',
  'Frequent breaks',
  'Mathematics tools',
  'Monitor test response',
  'Allow use of manipulatives',
  'Have student repeat and/or paraphrase information',
  'Break down assignments into smaller units',
  'Home-school communication system (weekly)',
  'Encourage student to ask for assistance when needed',
  'Preferential seating',
  'Adult support',
  'Chunking instructions and check in to ensure they are on-task and working',
  'Avoid multiple commands: give specific, clear, concrete instructions individually',
  'Repetition of class material',
  'Organizational aids',
  'Pre-teach new vocabulary',
  'Use pre-reading strategies and review discussions prior to reading',
  'Limit amount to be copied from the board',
  'Repeat/paraphrase information',
  'Frequent repetition of new skills',
  'Text-To-Speech (text Only)',
  'Check-ins with trusted adult',
  'Noise-canceling headphones',
  'Frequent changes in activity or opportunities for movement',
  'Proofreading checklist',
  'Assignments broken into smaller units',
  'Pictures to support reading passages',
  'Social skills training',
  'Process questions',
  'Delete extraneous info',
  'Math tools including Calculator on ALL calculator sections',
  'Picture schedule',
  'Adult support (medical and safety)',
  'Altered/modified assignments',
  'Prompting to support processing and participation in writing',
  'Large text (18-20 point font)',
  'Pictures to support reading',
  'Review health plan',
  'Graphic organizer',
  'Computer to use as spelling aid',
]

async function seed() {
  console.log('Seeding accommodations...')

  try {
    // Remove duplicates and create unique list
    const uniqueAccommodations = Array.from(new Set(accommodationsList))

    // Insert accommodations
    db.insert(accommodations).values(
      uniqueAccommodations.map((name, idx) => ({
        name,
        sortOrder: idx,
        isActive: true,
      }))
    ).onConflictDoNothing().run()

    console.log(`✓ Seeded ${uniqueAccommodations.length} accommodations`)
    console.log('Seed completed successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { seed }
