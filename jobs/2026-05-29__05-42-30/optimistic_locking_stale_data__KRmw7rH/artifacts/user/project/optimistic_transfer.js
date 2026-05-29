const { Sequelize, DataTypes, OptimisticLockError } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false
});

const Wallet = sequelize.define('Wallet', {
  balance: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  version: true
});

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: node optimistic_transfer.js <initial_balance> <amount1> <amount2>');
    process.exit(1);
  }

  const initialBalance = parseInt(args[0], 10);
  const amount1 = parseInt(args[1], 10);
  const amount2 = parseInt(args[2], 10);

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
    if (error instanceof OptimisticLockError) {
      const walletRefetched = await Wallet.findByPk(wallet.id);
      walletRefetched.balance += amount2;
      await walletRefetched.save();
    } else {
      throw error;
    }
  }

  const finalWallet = await Wallet.findByPk(wallet.id);
  console.log(`Final balance: ${finalWallet.balance}`);
}

main().catch(console.error);
