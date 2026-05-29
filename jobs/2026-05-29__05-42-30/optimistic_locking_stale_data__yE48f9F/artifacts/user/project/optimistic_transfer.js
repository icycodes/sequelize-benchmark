const { Sequelize, DataTypes, OptimisticLockError } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
});

const Wallet = sequelize.define(
  'Wallet',
  {
    balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    version: true,
  }
);

async function main() {
  const initialBalance = parseInt(process.argv[2], 10);
  const amount1 = parseInt(process.argv[3], 10);
  const amount2 = parseInt(process.argv[4], 10);

  await sequelize.sync();

  // Create a new wallet with the initial balance
  await Wallet.create({ balance: initialBalance });

  // Simulate concurrent update: fetch the same wallet twice
  const wallet1 = await Wallet.findByPk(1);
  const wallet2 = await Wallet.findByPk(1);

  // Update wallet1's balance by amount1 and save
  wallet1.balance += amount1;
  await wallet1.save();

  // Attempt to update wallet2's balance by amount2 and save (should fail with OptimisticLockError)
  try {
    wallet2.balance += amount2;
    await wallet2.save();
  } catch (error) {
    if (error instanceof OptimisticLockError) {
      // Re-fetch the wallet to get the latest version
      const refreshedWallet = await Wallet.findByPk(1);
      // Apply amount2 to the newly fetched balance
      refreshedWallet.balance += amount2;
      await refreshedWallet.save();
    } else {
      throw error;
    }
  }

  // Print the final balance
  const finalWallet = await Wallet.findByPk(1);
  console.log(`Final balance: ${finalWallet.balance}`);

  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});