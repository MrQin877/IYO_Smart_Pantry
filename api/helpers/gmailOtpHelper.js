import Imap from 'imap-simple';
import { simpleParser } from 'mailparser';

export async function getLatestOtp(email, password, timeout = 60000) {
  const config = {
    imap: {
      user: email,
      password: password,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      authTimeout: 30000,
    },
  };

  const connection = await Imap.connect(config);
  await connection.openBox('INBOX');

  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const searchCriteria = ['UNSEEN'];
    const fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'], markSeen: true };
    const messages = await connection.search(searchCriteria, fetchOptions);

    if (messages.length > 0) {
      const parsed = await simpleParser(messages[0].parts.filter(p => p.which === 'TEXT')[0].body);
      const otpMatch = parsed.text?.match(/\b\d{6}\b/);
      if (otpMatch) {
        await connection.end();
        return otpMatch[0]; // OTP code
      }
    }
    await new Promise(res => setTimeout(res, 3000)); // wait 3s before retry
  }

  await connection.end();
  throw new Error('OTP not found in Gmail inbox within timeout');
}
