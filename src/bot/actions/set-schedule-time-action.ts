import moment from "moment";
import { readFileSync } from "fs";
import { Markup, Telegraf } from "telegraf";

import { db } from "../../instances";
import { cleanText, format } from "../../utils/format";
import { updateWebinarById } from "../../controllers/webinar.controller";

export default function setScheduleTimeAction(bot: Telegraf) {
  bot.action(/^set_schedule_time-(.+)$/, (context) => {
    if (context.user.webinar.metadata.time) return;

    const text =
      context.callbackQuery && "data" in context.callbackQuery
        ? context.callbackQuery.data
        : undefined;

    if (text) {
      const [, ...dates] = text.split(/-/g);
      console.log(dates);
      const date = moment(dates.join("-"));

      const times = [
        "🕘 9AM",
        "🕚 11AM",
        "🕐 13PM",
        "🕒 15PM",
        "🕔 17PM",
        "🕖 19PM",
      ];

      return Promise.all([
        updateWebinarById(db, context.user.webinar.id, {
          metadata: {
            ...context.user.webinar.metadata,
            time: date.toISOString(),
          },
        }),
        context.replyWithMarkdownV2(
          readFileSync("locale/en/webinar/flow-6.md", "utf-8")
            .replace(
              "%name%",
              cleanText(
                format("%%", context.from.first_name, context.from.last_name)
              )
            )
            .replace("%date%", cleanText(moment().format("MMM Do YYYY"))),
          Markup.inlineKeyboard([
            ...times.map((value, index) => {
              const [emoji, time] = value.split(/\s+/g);
              date.add(index, "days").set({
                second: 0,
                minute: 0,
                hour: parseInt(time.replace(/AM|PM/i, "")),
              });

              return [
                Markup.button.callback(
                  date.format(format("% %", emoji, "h A")),
                  format("set_schedule_date-%", date.toISOString())
                ),
              ];
            }),
          ])
        ),
      ]);
    }
  });
}
