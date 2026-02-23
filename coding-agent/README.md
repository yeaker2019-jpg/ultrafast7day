# Coding Agent

AI Coding Agent powered by Claude Opus 4.6

## ติดตั้ง

```bash
cd coding-agent
npm install
```

## ตั้งค่า API Key

```bash
export ANTHROPIC_API_KEY=your-api-key-here
```

## การใช้งาน

### Interactive Mode (แนะนำ)
```bash
npx ts-node agent.ts
```

### ระบุ working directory
```bash
npx ts-node agent.ts /path/to/your/project
```

### Single-shot mode
```bash
npx ts-node agent.ts "เพิ่ม dark mode ให้กับ styles.css"
```

## ตัวอย่างคำสั่ง

```
👤 คุณ: อ่านไฟล์ index.html แล้วสรุปว่ามีอะไรบ้าง
👤 คุณ: แก้ bug ใน script.js บรรทัดที่ 42
👤 คุณ: เพิ่ม responsive design ให้กับ styles.css
👤 คุณ: หาไฟล์ที่มีคำว่า "TODO" ทั้งหมด
```

## Tools ที่ Agent ใช้ได้

| Tool | หน้าที่ |
|------|---------|
| Read | อ่านไฟล์ |
| Write | สร้างไฟล์ใหม่ |
| Edit | แก้ไขไฟล์ที่มีอยู่ |
| Bash | รันคำสั่ง shell |
| Glob | ค้นหาไฟล์ตาม pattern |
| Grep | ค้นหา text ในไฟล์ |
