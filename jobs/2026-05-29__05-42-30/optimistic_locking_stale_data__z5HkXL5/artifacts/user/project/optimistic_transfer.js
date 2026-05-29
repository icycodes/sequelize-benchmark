const { Sequelize, DataTypes, OptimisticLockError } = require("sequelize");

async function main() {
  const [initialBalanceArg, amount1Arg, amount2Arg] = process.argv.slice(2);

  if ([initialBalanceArg, amount1Arg, amount2Arg].some((value) => value === undefined)) {
    console.error("Usage: node optimistic_transfer.js <initial_balance> <amount1> <amount2>");
    process.exit(1);
  }

  const initialBalance = Number.parseInt(initialBalanceArg, 10);
  const amount1 = Number.parseInt(amount1Arg, 10);
  const amount2 = Number.parseInt(amount2Arg, 10);

  if ([initialBalance, amount1, amount2].some((value) => Number.isNaN(value))) {
    console.error("All arguments must be integers.");
    process.exit(1);
  }

  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  });

  const Wallet = sequelize.define(
    "Wallet",
    {
      balance: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      version: true,
    }
  );

  await sequelize.sync({ force: true });

  const wallet = await Wallet.create({ balance: initialBalance });

  const wallet1 = await Wallet.findByPk(wallet.id);
  const wallet2 = await Wallet.findByPk(wallet.id);

  wallet1.balance += amount1;
  await wallet1.save();

  try {
    wallet2.balance += amount2;
    await wallet2.save();
  } catch (error) {
    if (!(error instanceof OptimisticLockError)) {
      throw error;
    }

    const freshWallet = await Wallet.findByPk(wallet.id);
    freshWallet.balance += amount2;
    await freshWallet.save();
  }

  const finalWallet = await Wallet.findByPk(wallet.id);
  console.log(`Final balance: ${finalWallet.balance}`);

  await sequelize.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
