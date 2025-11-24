import { filterEvents, RawEvent } from './lib/eventFilter';

const testEvents: RawEvent[] = [
    {
        id: '1',
        title: 'Morning Yoga',
        description: 'A gentle flow for beginners.',
        tags: ['yoga', 'beginner'],
    },
    {
        id: '2',
        title: 'Startup Pitch Competition',
        description: 'Win big prizes!',
        tags: ['contest', 'hustle'],
    },
    {
        id: '3',
        title: 'Silent Garden Walk',
        description: 'Enjoy nature in silence.',
        tags: ['nature', 'silent'],
    },
];

const filtered = filterEvents(testEvents);
console.log(JSON.stringify(filtered, null, 2));
