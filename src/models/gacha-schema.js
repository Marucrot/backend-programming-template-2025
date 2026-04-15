module.exports = (db) =>
  db.model(
    'GachaLogs',
    db.Schema(
      {
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        prize: { type: String, default: null },
        gachaDate: { type: String, required: true },
      },
      { timestamps: true }
    )
  );