import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="voice-record"
export default class extends Controller {
  static targets = ['microphone', 'fillEffect', 'voiceInstructions']

  newRecord() {
    this.voiceInstructionsTarget.classList.remove('hidden')
    this.fillEffectTarget.classList.remove('initial')
    this.fillEffectTarget.classList.add('filled')
    this.microphoneTarget.classList.add('pointer-events-none')
  }
}
