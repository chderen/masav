import { MasaVSendPayments, InstitutionSendPayment, SendPaymentsRecord, MasaVGetPayments } from "../index";
import InstitutionGetPayment from "../institutionGetPayment";
import GetPaymentsRecord from "../getPaymentRecord";

// 40 payments of 19.90 sum to 795.99999999999943 in naive float
// accumulation, so the file would contain 795.00 instead of 796.00
const AMOUNTS = Array(40).fill(19.9);

function sumRecord(buffer: Buffer): string {
  const line = buffer.toString("ascii").split("\r\n").find((l) => l.startsWith("512345678"));
  if (!line) throw new Error("sum record not found");
  return line;
}

test("get file: 40 payments of 19.90 sum to exactly 796.00", () => {
  const masavFile = new MasaVGetPayments();
  const institution = new InstitutionGetPayment(
    "12345678", "12345", "200507", "200507", "Company ISRAEL LTD.", "404"
  );
  institution.addPaymentRecords(
    AMOUNTS.map((amount, i) => new GetPaymentsRecord(
      "11", "303", "007008629", "123123127", `Payee ${i}`, "00000000000001313131", amount
    ))
  );
  masavFile.addInstitution(institution);
  const record = sumRecord(masavFile.toBuffer());
  expect(record.slice(36, 49)).toBe("0000000000796");
  expect(record.slice(49, 51)).toBe("00");
});

test("send file: 40 payments of 19.90 sum to exactly 796.00", () => {
  const masavFile = new MasaVSendPayments();
  const institution = new InstitutionSendPayment(
    "12345678", "12345", "200507", "200507", "Company ISRAEL LTD.", "404"
  );
  institution.addPaymentRecords(
    AMOUNTS.map((amount, i) => new SendPaymentsRecord(
      "11", "303", "007008629", "123123127", `Payee ${i}`, "00000000000001313131", amount
    ))
  );
  masavFile.addInstitution(institution);
  const record = sumRecord(masavFile.toBuffer());
  expect(record.slice(21, 34)).toBe("0000000000796");
  expect(record.slice(34, 36)).toBe("00");
});
