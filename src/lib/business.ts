/**
 * Canonical business / brand identity.
 *
 * These values MUST match the brand record registered with The Campaign Registry
 * (TCR) and Telnyx for our 10DLC A2P messaging campaign. Carriers validate that
 * the identifying information shown publicly on theblife.com (business name,
 * address, phone, email) matches what is on file. If you change the brand record,
 * change it here too — and vice versa.
 *
 * TCR brand: "The B Life" (brandId 4b20019e-c804-02a1-a215-11abf8837221)
 */
export const BUSINESS = {
    /** DBA / brand name as registered with TCR. */
    brandName: 'The B Life',
    /** Stylized brand used in marketing copy across the site. */
    displayName: 'The b. Life',
    /** Legal entity that owns the brand and the messaging campaign. */
    legalName: 'Eau Gallie Solutions LLC',

    address: {
        street: '1153 Bell St',
        city: 'Melbourne',
        state: 'FL',
        postalCode: '32935',
        country: 'US',
    },

    /** Public business phone (matches TCR brand record). */
    phone: '+17202529874',
    phoneDisplay: '(720) 252-9874',

    /** Public business email (matches TCR brand record). */
    email: 'dave@theblife.com',
    /** General support inbox used elsewhere on the site. */
    supportEmail: 'hello@theblife.com',

    website: 'https://theblife.com',
} as const;

/** "1153 Bell St, Melbourne, FL 32935" */
export const BUSINESS_ADDRESS_ONE_LINE = `${BUSINESS.address.street}, ${BUSINESS.address.city}, ${BUSINESS.address.state} ${BUSINESS.address.postalCode}`;
