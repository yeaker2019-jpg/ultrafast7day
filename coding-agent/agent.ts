import { query } from "@anthropic-ai/claude-agent-sdk";
import * as readline from "readline";
import * as path from "path";

// กำหนด working directory เป็นโปรเจกต์ที่ต้องการ
// สามารถเปลี่ยนเป็น path อื่นได้, หรือรับจาก argument
const PROJECT_DIR = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve("..");

const SYSTEM_PROMPT = `คุณคือ AI Coding Assistant ที่เชี่ยวชาญด้านการเขียนโค้ด
คุณสามารถ:
- อ่านและแก้ไขไฟล์โค้ดได้โดยตรง
- รันคำสั่ง shell เพื่อทดสอบหรือ build โปรเจกต์
- ค้นหาไฟล์และ pattern ในโค้ด
- แนะนำและแก้บั๊กในโค้ด

Working directory: ${PROJECT_DIR}

ให้ตอบเป็นภาษาไทยเสมอ และอธิบายสิ่งที่คุณกำลังทำก่อนลงมือทำ`;

async function runAgent(prompt: string): Promise<void> {
  console.log("\n🤖 Agent กำลังทำงาน...\n");

  try {
    for await (const message of query({
      prompt,
      options: {
        cwd: PROJECT_DIR,
        model: "claude-opus-4-6",
        systemPrompt: SYSTEM_PROMPT,
        allowedTools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
        permissionMode: "acceptEdits",
        maxTurns: 30,
      },
    })) {
      // แสดง tool use
      if ("type" in message && message.type === "assistant") {
        const content = (message as any).content;
        if (Array.isArray(content)) {
          for (const block of content) {
            if (block.type === "text" && block.text) {
              process.stdout.write(block.text);
            } else if (block.type === "tool_use") {
              console.log(`\n[🔧 ใช้ tool: ${block.name}]`);
            }
          }
        }
      }

      // แสดงผลลัพธ์สุดท้าย
      if ("result" in message) {
        console.log("\n\n✅ เสร็จสิ้น!");
        if (message.result) {
          console.log("\n📋 สรุป:\n" + message.result);
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("\n❌ เกิดข้อผิดพลาด:", error.message);
    }
    throw error;
  }
}

async function interactiveMode(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("🚀 Coding Agent พร้อมใช้งาน!");
  console.log(`📁 โปรเจกต์: ${PROJECT_DIR}`);
  console.log('💡 พิมพ์ "exit" หรือ "quit" เพื่อออก\n');

  const askQuestion = (): void => {
    rl.question("👤 คุณ: ", async (input) => {
      const trimmed = input.trim();

      if (!trimmed) {
        askQuestion();
        return;
      }

      if (trimmed.toLowerCase() === "exit" || trimmed.toLowerCase() === "quit") {
        console.log("\n👋 ลาก่อน!");
        rl.close();
        return;
      }

      try {
        await runAgent(trimmed);
      } catch {
        console.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
      }

      console.log("\n" + "─".repeat(60) + "\n");
      askQuestion();
    });
  };

  askQuestion();
}

async function main(): Promise<void> {
  // ตรวจสอบ API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ กรุณาตั้งค่า ANTHROPIC_API_KEY environment variable");
    console.error("   export ANTHROPIC_API_KEY=your-api-key-here");
    process.exit(1);
  }

  // รับ prompt จาก argument หรือเข้า interactive mode
  const args = process.argv.slice(2);

  // ถ้า arg แรกเป็น path ให้ใช้เป็น working dir, arg ต่อไปเป็น prompt
  let promptArgs = args;
  if (args[0] && (args[0].startsWith("/") || args[0].startsWith("."))) {
    promptArgs = args.slice(1);
  }

  if (promptArgs.length > 0) {
    // Single-shot mode: รับ prompt จาก command line
    const prompt = promptArgs.join(" ");
    await runAgent(prompt);
  } else {
    // Interactive mode
    await interactiveMode();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
