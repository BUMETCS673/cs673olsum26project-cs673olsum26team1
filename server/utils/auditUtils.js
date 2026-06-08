const createAuditEntry = async (
  prisma, patientId,
  column, oldValue, newValue
) => {
  await prisma.auditLog.create({
    data: {
      patientId: patientId,
      column:    column,
      oldValue:  String(oldValue),
      newValue:  String(newValue),
    }
  });
};

module.exports = { createAuditEntry };
