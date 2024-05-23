import { Injectable, OnModuleInit } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { UserRole } from '../user/entities/user-role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Bot, InlineKeyboard } from 'grammy';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Bot;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const token: string = this.configService.get<string>('bot.token');
    this.initAdminBot(token);
  }

  async initAdminBot(token: string) {
    this.bot = new Bot(token);

    await this.bot.api.setMyCommands([
      { command: 'start', description: 'Тут бот з вами просто привітається' },
      { command: 'showall', description: 'Покаже всіх непідтверджених' },
    ]);

    this.bot.command('start', async (ctx) => {
      const { message, keyboard } = await this.renderUserPage(1);
      await ctx.reply(message, {
        reply_markup: keyboard,
        parse_mode: 'Markdown',
      });
    });

    this.bot.on('callback_query:data', async (ctx) => {
      const data = ctx.callbackQuery.data;

      if (data === 'add_all') {
        await this.confirmAllMembers();
        await ctx.answerCallbackQuery({
          text: 'Усі користувачі підтверджені!',
        });
      }

      if (data === 'remove_all') {
        await this.rejectAllMembers();
        await ctx.answerCallbackQuery({ text: 'Усі користувачі відхилені!' });
      }

      if (data.startsWith('page_')) {
        const page = parseInt(data.split('_')[1]);
        const { message, keyboard } = await this.renderUserPage(page);
        await ctx.editMessageText(message, {
          reply_markup: keyboard,
          parse_mode: 'Markdown',
        });
      } else if (data.startsWith('confirm_')) {
        const userId = data.split('_')[1];
        await this.confirmMember(userId);
        await ctx.answerCallbackQuery({ text: 'Користувача підтверджено!' });
        const { message, keyboard } = await this.renderUserPage(1);
        await ctx.editMessageText(message, {
          reply_markup: keyboard,
          parse_mode: 'Markdown',
        });
      } else if (data.startsWith('reject_')) {
        const userId = data.split('_')[1];
        await this.rejectMember(userId);
        await ctx.answerCallbackQuery({ text: 'Користувача відхилено!' });
        const { message, keyboard } = await this.renderUserPage(1);
        await ctx.editMessageText(message, {
          reply_markup: keyboard,
          parse_mode: 'Markdown',
        });
      }
    });

    await this.bot.start();
  }

  async renderUserPage(page: number) {
    const ITEMS_PER_PAGE = 1;
    const { users, total } = await this.getPendingUsers(page, ITEMS_PER_PAGE);
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    if (users.length === 0) {
      return {
        message: 'Немає користувачів для підтвердження.',
        keyboard: new InlineKeyboard(),
      };
    }

    const user = users[0];
    let message = `Запит ${page} з ${totalPages}\n\n`;
    message += `_Name_: *${user.name}*\n`;
    message += `_Surname_: *${user.surname}*\n`;
    message += `_Phone_: *${user.phone}*\n`;
    message += `_Email_: *${user.email}*\n`;

    const keyboard = new InlineKeyboard();
    keyboard
      .text('✅ Підтвердити всіх', 'add_all')
      .row()
      .text('❌ Відхилити всіх', 'remove_all')
      .row()
      .text('🟢 Підтвердити', `confirm_${user.id}`)
      .text('🔴 Відхилити', `reject_${user.id}`)
      .row();

    if (page > 1) keyboard.text('⬅️ Попередня', `page_${page - 1}`);
    if (page < totalPages) keyboard.text('➡️ Наступна', `page_${page + 1}`);

    return { message, keyboard };
  }

  async getPendingUsers(page: number, limit: number) {
    const [users, total] = await this.userRepository.findAndCount({
      where: { role: UserRole.PENDING },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { users, total };
  }

  async confirmMember(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new Error('User not found');

    user.role = UserRole.USER;
    await this.userRepository.save(user);
  }

  async rejectMember(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new Error('User not found');
    await this.userRepository.remove(user);
  }

  async confirmAllMembers() {
    const pendingUsers = await this.userRepository.find({
      where: { role: UserRole.PENDING },
    });

    for (const user of pendingUsers) {
      user.role = UserRole.USER;
      await this.userRepository.save(user);
    }
  }

  async rejectAllMembers() {
    const pendingUsers = await this.userRepository.find({
      where: { role: UserRole.PENDING },
    });

    await this.userRepository.remove(pendingUsers);
  }
}
