import { TOOL_REGISTRY } from './tool-registry';

export interface PrivacyNote {
  title: string;
  toolIds: string[];
  note: string;
}

export const PRIVACY_NOTES: PrivacyNote[] = [
  {
    title: 'Files',
    toolIds: ['image-converter', 'pdf-merge'],
    note: 'Selected images and PDFs are read by browser APIs on your device. They are not uploaded to wutil for conversion or merging.',
  },
  {
    title: 'Sensitive text',
    toolIds: ['password-generator', 'hash-generator', 'regex-tester', 'json-formatter', 'base64-converter', 'url-encoder', 'text-case', 'word-counter'],
    note: 'Text entered into these tools is processed in the page session. wutil does not intentionally store it or send it to backend processing endpoints.',
  },
  {
    title: 'Dates, colors, and units',
    toolIds: ['timestamp', 'date-calculator', 'color-converter', 'unit-converter'],
    note: 'These tools operate on values typed into the page and keep calculations local to the browser.',
  },
];

export function getPrivacyToolNames(toolIds: string[]) {
  return toolIds.map((toolId) => {
    const tool = TOOL_REGISTRY.find((item) => item.id === toolId);
    if (!tool) {
      throw new Error(`Unknown privacy tool id: ${toolId}`);
    }
    return tool.name;
  });
}
