import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="voice-record"
export default class extends Controller {
  static targets = ['microphone', 'fillEffect', 'voiceInstructions', 'audioRecord',
                    'stop']

  newRecord() {
    this.voiceInstructionsTarget.classList.remove('hidden');
    this.microphoneTarget.classList.add('invisible');
    this.stopTarget.classList.remove('invisible')
    this.audioRecordTarget.classList.remove('hidden')

    this.createUserAudio()
  }

  stopRecord() {

    // Arrêtez l'enregistrement audio ici
    // Vous devez avoir accès à l'objet `source` ou `stream` pour arrêter l'enregistrement

    // Par exemple, si vous utilisez MediaStream, vous pouvez appeler `stop()` sur l'objet MediaStream pour arrêter l'enregistrement
    const mediaStream = this.stream;
    if (mediaStream && mediaStream.getTracks) {
      mediaStream.getTracks().forEach(track => track.stop());
    }

    // Cachez le canevas de visualisation et affichez le bouton "Enregistrer" à nouveau
    this.audioRecordTarget.classList.add('hidden');
    this.microphoneTarget.classList.remove('invisible');
    this.stopTarget.classList.add('invisible')
  }


  createUserAudio() {
  // Obtenir l'audio (par exemple, à partir d'un microphone)
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        // Créer un contexte audio
        this.stream = stream
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);

        // Créer un nœud d'analyse
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048; // Taille de la FFT pour l'analyse (modifiable selon vos besoins)

        // Connecter les nœuds
        source.connect(analyser);
        // Connectez le nœud d'analyse à la destination finale (par exemple, les haut-parleurs)
        analyser.connect(audioContext.destination);

        // Obtenir les données audio
        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);

        // Visualiser les données audio
        const draw = () => {
          requestAnimationFrame(draw);

          // Obtenez les données audio d'amplitude dans le domaine temporel
          analyser.getByteTimeDomainData(dataArray);

          // Dessinez votre effet de vague basé sur les données audio ici
          // Utilisez les valeurs de dataArray pour déterminer les dimensions et les positions des vagues

          // Exemple : Dessiner une vague sur un canevas HTML
          const canvas = document.getElementById('waveCanvas');
          const context = canvas.getContext('2d');
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.lineWidth = 3;
          context.strokeStyle = '#FFC300';
          context.beginPath();
          const sliceWidth = canvas.width * 1.0 / bufferLength;
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * canvas.height / 2;
            if (i === 0) {
              context.moveTo(x, y);
            } else {
              context.lineTo(x, y);
            }
            x += sliceWidth;
          }
          context.lineTo(canvas.width, canvas.height / 2);
          context.stroke();
        }

        // Appeler la fonction draw pour commencer la visualisation
        draw();
      })
      .catch(function(error) {
        console.error('Erreur lors de l\'obtention de l\'audio :', error);
      });
  }

}
