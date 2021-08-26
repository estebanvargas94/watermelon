import admin from "../../../../../utils/firebase/backend";
import logger from "../../../../../logger/logger";
import { postMessage } from "../../../../../utils/slack/backend";
import { getAllQuestions } from "../../../../../utils/airtable/backend";
export default async function handler(req, res) {
  let db = admin.firestore();
  const {
    query: { teamId },
  } = req;
  if (!teamId) {
    logger.error({
      message: "no teamid",
    });
    res.status(400).json({ status: "error", error: "no team id" });
  }
  let questions = await getAllQuestions();
  let questionsToSend = [];
  while (questionsToSend.length < 1) {
    let item = questions[Math.floor(Math.random() * questions.length)];
    if (!questionsToSend.includes(item)) questionsToSend.push(item);
  }

  const setQuestion = (record, answer) => {
    db.collection("teams")
      .doc(`${teamId}/weekly_questions/${record.get("Question")}`)
      .set(
        { icebreaker: record.get("Icebreaker"), respondents: [] },
        { merge: true }
      )
      .then((fbres) => {
        db.collection("teams")
          .doc(`${teamId}`)
          .collection("weekly_questions")
          .doc(record.get("Question"))
          .collection(answer)
          .doc("picked_by")
          .set(
            {
              picked_by: [],
            },
            { merge: true }
          )
          .then(() => {})
          .catch(function (error) {
            console.error("Error writing: ", error);
          });
      });
  };
  let blocks = [];
  for (let i = 0; i < questionsToSend.length; i++) {
    let record = questionsToSend[i];
    setQuestion(record, record.get("AnswerA"));
    setQuestion(record, record.get("AnswerB"));
    setQuestion(record, record.get("AnswerC"));
    setQuestion(record, record.get("AnswerD"));

    let questionElements = {
      type: "actions",
      elements: [
        {
          action_id: `q${record.get("Number")}Aa`,
          type: "button",
          text: {
            text: record.get("AnswerA"),
            type: "plain_text",
          },
          value: record.get("AnswerA"),
        },
        {
          action_id: `q${record.get("Number")}Ab`,
          type: "button",
          text: {
            text: record.get("AnswerB"),
            type: "plain_text",
          },
          value: record.get("AnswerB"),
        },
      ],
    };
    if (record.get("AnswerC"))
      questionElements.elements.push({
        action_id: `q${record.get("Number")}Ac`,
        type: "button",
        text: {
          text: record.get("AnswerC"),
          type: "plain_text",
        },
        value: record.get("AnswerC"),
      });
    if (record.get("AnswerD"))
      questionElements.elements.push({
        action_id: `q${record.get("Number")}Ad`,
        type: "button",
        text: {
          text: record.get("AnswerD"),
          type: "plain_text",
        },
        value: record.get("AnswerD"),
      });
    blocks.push(
      {
        type: "context",
        elements: [{ text: record.get("Question"), type: "plain_text" }],
      },
      questionElements,
      {
        type: "divider",
      }
    );
  }
  let fbRes = await db.collection("teams").doc(teamId).get();
  if (fbRes.exists) {
    let data = fbRes.data();
    if (data?.add_to_slack_token?.access_token) {
      let postMessageRes = await postMessage({
        data: {
          text: "Time to answer some questions 🍉",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Welcome to Watermelon :watermelon:!*
Working remotely has isolated us from office interactions and socially active environments. While some may enjoy that, most of us miss being able to chat with our colleagues by just rolling our chairs.
We will help you discover interesting, smart, and open-minded people like you.
Let’s get started, pick one answer below :point_down:
<!here>`,
              },
            },
            ...blocks,
          ],
          channel: data.add_to_slack_token.incoming_webhook.channel_id,
        },
        token: data.add_to_slack_token.access_token,
      });
      if (postMessageRes.status === "ok") {
        logger.info(postMessageRes);
        res.status(200).send(postMessageRes);
      } else {
        logger.error(postMessageRes);
        res.status(500).send(postMessageRes);
      }
    } else {
      logger.error({ message: "no access token", data });
      res.status(500).send({ status: "error", error: "no access token" });
    }
  } else {
    logger.error({ message: "Error fetching: " });
    res
      .status(500)
      .json(JSON.stringify({ ok: false, message: "error fetching" }));
  }
}
