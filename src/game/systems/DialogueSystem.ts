import Phaser from 'phaser';
import type { DialogueLine } from '../types/gameTypes';

export class DialogueSystem {
  private container: Phaser.GameObjects.Container;
  private text: Phaser.GameObjects.Text;
  private speaker: Phaser.GameObjects.Text;
  private lines: DialogueLine[] = [];
  private index = 0;
  private onDone?: () => void;

  constructor(private scene: Phaser.Scene) {
    const width = scene.scale.width;
    const height = scene.scale.height;
    const box = scene.add.rectangle(0, 0, width - 48, 104, 0x111827, 0.96).setStrokeStyle(2, 0xf9fafb);
    this.speaker = scene.add.text(-width / 2 + 48, -42, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#fde68a'
    });
    this.text = scene.add.text(-width / 2 + 48, -14, '', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#f9fafb',
      wordWrap: { width: width - 88 }
    });

    this.container = scene.add.container(width / 2, height - 72, [box, this.speaker, this.text]);
    this.container.setDepth(1000);
    this.container.setVisible(false);
  }

  get isOpen(): boolean {
    return this.container.visible;
  }

  start(lines: DialogueLine[], onDone?: () => void): void {
    this.lines = lines;
    this.index = 0;
    this.onDone = onDone;
    this.container.setVisible(true);
    this.showCurrentLine();
  }

  advance(): void {
    if (!this.isOpen) {
      return;
    }

    this.lines[this.index]?.onComplete?.();
    this.index += 1;

    if (this.index >= this.lines.length) {
      this.container.setVisible(false);
      this.onDone?.();
      return;
    }

    this.showCurrentLine();
  }

  private showCurrentLine(): void {
    const line = this.lines[this.index];
    this.speaker.setText(line.speaker);
    this.text.setText(line.text);
  }
}
