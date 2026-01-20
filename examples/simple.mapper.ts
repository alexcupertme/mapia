import { compileMapper, dateDecoder, nullableShapeFrom, rename, transform } from "../src";

type EmailLetterDto = {
  subject: string;
  body: string;
  recipient: string;
  sender: string;
  sentAt: Date | null;
};

type EmailLetterRequest = {
  subject: string;
  payload: string;
  recipient: string;
  sender: string;
  sentAt: string | null;
};

const emailLetterMapper = compileMapper<EmailLetterRequest, EmailLetterDto>({
  subject: "subject",
  body: rename('payload'),
  recipient: 'recipient',
  sender: "sender",
  sentAt: transform(nullableShapeFrom(dateDecoder)),
});

export const emailLetterResponse: EmailLetterRequest = {
  subject: "Meeting Reminder",
  payload: "Don't forget about the meeting tomorrow at 10 AM.",
  recipient: "jane.doe@example.com",
  sender: "john.doe@example.com",
  sentAt: "2025-05-04T15:00:00Z",
};

console.log(emailLetterMapper.mapOne(emailLetterResponse));