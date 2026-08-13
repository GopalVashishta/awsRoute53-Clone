export const RECORD_TYPES = ['A','AAAA','CNAME','TXT','MX','NS','PTR','SRV','CAA'] as const;
export type RecordType = typeof RECORD_TYPES[number];

export const TTL_PRESETS = [
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
  { label: '15 minutes', value: 900 },
  { label: '1 hour', value: 3600 },
  { label: '24 hours', value: 86400 },
];

export const MOCK_ACCOUNT = {
  accountId: '123456789012',
  arn: 'arn:aws:iam::123456789012:root',
  region: 'us-east-1',
  regionLabel: 'US East (N. Virginia)',
};
