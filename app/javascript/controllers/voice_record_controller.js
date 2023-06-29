import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = [
    'microphone', 'voiceInstructions', 'stopButton', 'elapsedTimeTag',
    'playInstructions', 'recordingControlButtonsContainer', 'audioElement',
    'textIndicatorAudioPlaying', 'overlay'
  ];

    audioRecorder = {
    /** Stores the recorded audio as Blob objects of audio data as the recording continues*/
      audioBlobs: [],/*of type Blob[]*/
      /** Stores the reference of the MediaRecorder instance that handles the MediaStream when recording starts*/
      mediaRecorder: null, /*of type MediaRecorder*/
      /** Stores the reference to the stream currently capturing the audio*/
      streamBeingCaptured: null, /*of type MediaStream*/
      /** Start recording the audio
       * @returns {Promise} - returns a promise that resolves if audio recording successfully started
       */
      start: () => {
          //Feature Detection
          if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
              //Feature is not supported in browser
              //return a custom error
              return Promise.reject(new Error('mediaDevices API or getUserMedia method is not supported in this browser.'));
          }

          else {
              //Feature is supported in browser

              //create an audio stream
              return navigator.mediaDevices.getUserMedia({ audio: true }/*of type MediaStreamConstraints*/)
                  //returns a promise that resolves to the audio stream
                  .then(stream /*of type MediaStream*/ => {

                      //save the reference of the stream to be able to stop it when necessary
                      this.audioRecorder.streamBeingCaptured = stream;

                      //create a media recorder instance by passing that stream into the MediaRecorder constructor
                      this.audioRecorder.mediaRecorder = new MediaRecorder(stream); /*the MediaRecorder interface of the MediaStream Recording
                      API provides functionality to easily record media*/

                      //clear previously saved audio Blobs, if any
                      this.audioRecorder.audioBlobs = [];

                      //add a dataavailable event listener in order to store the audio data Blobs when recording
                      this.audioRecorder.mediaRecorder.addEventListener("dataavailable", event => {
                          //store audio Blob object
                          this.audioRecorder.audioBlobs.push(event.data);
                      });

                      //start the recording by calling the start method on the media recorder
                      this.audioRecorder.mediaRecorder.start();
                  });

              /* errors are not handled in the API because if its handled and the promise is chained, the .then after the catch will be executed*/
          }
      },
      /** Stop the started audio recording
       * @returns {Promise} - returns a promise that resolves to the audio as a blob file
       */
      stop: () => {
          //return a promise that would return the blob or URL of the recording
          return new Promise(resolve => {
              //save audio type to pass to set the Blob type
              let mimeType = this.audioRecorder.mediaRecorder.mimeType;

              //listen to the stop event in order to create & return a single Blob object
              this.audioRecorder.mediaRecorder.addEventListener("stop", () => {
                  //create a single blob object, as we might have gathered a few Blob objects that needs to be joined as one
                  let audioBlob = new Blob(this.audioRecorder.audioBlobs, { type: mimeType });

                  //resolve promise with the single audio blob representing the recorded audio
                  resolve(audioBlob);
              });
              this.audioRecorder.cancel();
          });
      },
      /** Cancel audio recording*/
      cancel: () => {
          //stop the recording feature
          this.audioRecorder.mediaRecorder.stop();

          //stop all the tracks on the active stream in order to stop the stream
          this.audioRecorder.stopStream();

          //reset API properties for next recording
          this.audioRecorder.resetRecordingProperties();
      },
      /** Stop all the tracks on the active stream in order to stop the stream and remove
       * the red flashing dot showing in the tab
       */
      stopStream: () => {
          //stopping the capturing request by stopping all the tracks on the active stream
          this.audioRecorder.streamBeingCaptured.getTracks() //get all tracks from the stream
              .forEach(track /*of type MediaStreamTrack*/ => track.stop()); //stop each one
      },
      /** Reset all the recording properties including the media recorder and stream being captured*/
      resetRecordingProperties: () => {
          this.audioRecorder.mediaRecorder = null;
          this.audioRecorder.streamBeingCaptured = null;

          /*No need to remove event listeners attached to mediaRecorder as
          If a DOM element which is removed is reference-free (no references pointing to it), the element itself is picked
          up by the garbage collector as well as any event handlers/listeners associated with it.
          getEventListeners(audioRecorder.mediaRecorder) will return an empty array of events.*/
      }
    }

  audioRecordStartTime = null
  maximumRecordingTimeInHours = 1
  elapsedTimeTimer = null

  startAudioRecording() {

    console.log("Recording Audio...");
    //If a previous audio recording is playing, pause it
    let recorderAudioIsPlaying = !this.audioElementTarget.paused; // the paused property tells whether the media element is paused or not
    console.log("paused?", !recorderAudioIsPlaying);
    if (recorderAudioIsPlaying) {
        this.audioElementTarget.pause();
    }

    //start recording using the audio recording API
   this.audioRecorder.start()
        .then(() => { //on success

            //store the recording start time to display the elapsed time according to it
            this.audioRecordStartTime = new Date();
            //display control buttons to offer the functionality of stop and cancel
            this.handleDisplayingRecordingControlButtons();
        })
        .catch(error => { //on error
            //No Browser Support Error
            if (error.message.includes("mediaDevices API or getUserMedia method is not supported in this browser.")) {
                console.log("To record audio, use browsers like Chrome and Firefox.");
                this.displayBrowserNotSupportedOverlay();
            }

            //Error handling structure
            switch (error.name) {
                case 'AbortError': //error from navigator.mediaDevices.getUserMedia
                    console.log("An AbortError has occured.");
                    break;
                case 'NotAllowedError': //error from navigator.mediaDevices.getUserMedia
                    console.log("A NotAllowedError has occured. User might have denied permission.");
                    break;
                case 'NotFoundError': //error from navigator.mediaDevices.getUserMedia
                    console.log("A NotFoundError has occured.");
                    break;
                case 'NotReadableError': //error from navigator.mediaDevices.getUserMedia
                    console.log("A NotReadableError has occured.");
                    break;
                case 'SecurityError': //error from navigator.mediaDevices.getUserMedia or from the MediaRecorder.start
                    console.log("A SecurityError has occured.");
                    break;
                case 'TypeError': //error from navigator.mediaDevices.getUserMedia
                    console.log("A TypeError has occured.");
                    break;
                case 'InvalidStateError': //error from the MediaRecorder.start
                    console.log("An InvalidStateError has occured.");
                    break;
                case 'UnknownError': //error from the MediaRecorder.start
                    console.log("An UnknownError has occured.");
                    break;
                default:
                    console.log("An error occured with the error name " + error.name);
            };
        });
  }

  stopAudioRecording() {

    console.log("Stopping Audio Recording...");

    //stop the recording using the audio recording API
    this.audioRecorder.stop()
        .then(audioAsblob => {
            //Play recorder audio
            this.playAudio(audioAsblob);

            //hide recording control button & return record icon
            this.handleHidingRecordingControlButtons();
        })
        .catch(error => {
            //Error handling structure
            switch (error.name) {
                case 'InvalidStateError': //error from the MediaRecorder.stop
                    console.log("An InvalidStateError has occured.");
                    break;
                default:
                    console.log("An error occured with the error name " + error.name);
            };
        });
  }

    /** Cancel the currently started audio recording */
  cancelAudioRecording() {
      console.log("Canceling audio...");

      //cancel the recording using the audio recording API
      this.audioRecorder.cancel();

      //hide recording control button & return record icon
      this.handleHidingRecordingControlButtons();
  }


  /** Plays recorded audio using the audio element in the HTML document
   * @param {Blob} recorderAudioAsBlob - recorded audio as a Blob Object
  */
  playAudio(recorderAudioAsBlob) {

      //read content of files (Blobs) asynchronously
      let reader = new FileReader();

      //once content has been read
      reader.onload = (e) => {
          //store the base64 URL that represents the URL of the recording audio
          let base64URL = e.target.result;

          //If this is the first audio playing, create a source element
          //as pre populating the HTML with a source of empty src causes error
          if (!audioElementSource) //if its not defined create it (happens first time only)
              this.createSourceForAudioElement();

          //set the audio element's source using the base64 URL
          audioElementSource.src = base64URL;

          //set the type of the audio element based on the recorded audio's Blob type
          let BlobType = recorderAudioAsBlob.type.includes(";") ?
              recorderAudioAsBlob.type.substr(0, recorderAudioAsBlob.type.indexOf(';')) : recorderAudioAsBlob.type;
          audioElementSource.type = BlobType

          //call the load method as it is used to update the audio element after changing the source or other settings
          this.audioElementTarget.load();

          //play the audio after successfully setting new src and type that corresponds to the recorded audio
          console.log("Playing audio...");
          this.audioElementTarget.play();

          //Display text indicator of having the audio play in the background
          this.displayTextIndicatorOfAudioPlaying();
      };

      //read content and convert it to a URL (base64)
      reader.readAsDataURL(recorderAudioAsBlob);
  }

  handleDisplayingRecordingControlButtons() {
    //Hide the microphone button that starts audio recording
    this.microphoneTarget.style.display = "none";

    //Display the recording control buttons
    this.recordingControlButtonsContainerTarget.classList.remove("hide");

    //Handle the displaying of the elapsed recording time
    this.handleElapsedRecordingTime();
  }

  /** Hide the displayed recording control buttons */
  handleHidingRecordingControlButtons() {
    //Display the microphone button that starts audio recording
    this.microphoneTarget.style.display = "block";

    //Hide the recording control buttons
    this.recordingControlButtonsContainerTarget.classList.add("hide");

    //stop interval that handles both time elapsed and the red dot
    clearInterval(this.elapsedTimeTimer);
  }

  /** Computes the elapsed recording time since the moment the function is called in the format h:m:s*/
  handleElapsedRecordingTime() {
    //display inital time when recording begins
    this.displayElapsedTimeDuringAudioRecording("00:00");

    //create an interval that compute & displays elapsed time, as well as, animate red dot - every second
    this.elapsedTimeTimer = setInterval(() => {
        //compute the elapsed time every second
        let elapsedTime = this.computeElapsedTime(this.audioRecordStartTime); //pass the actual record start time
        //display the elapsed time
        this.displayElapsedTimeDuringAudioRecording(elapsedTime);
    }, 1000); //every second
  }

  /** Displays browser not supported info box for the user*/
  displayBrowserNotSupportedOverlay() {
    this.overlayTarget.classList.remove("hide");
  }

  /** Displays browser not supported info box for the user*/
  hideBrowserNotSupportedOverlay() {
    this.overlayTarget.classList.add("hide");
  }

    /** Creates a source element for the the audio element in the HTML document*/
  createSourceForAudioElement() {
    let sourceElement = document.createElement("source");
    this.audioElementTarget.appendChild(sourceElement);

    audioElementSource = sourceElement;
  }

  /** Display elapsed time during audio recording
  * @param {String} elapsedTime - elapsed time in the format mm:ss or hh:mm:ss
  */
  displayElapsedTimeDuringAudioRecording(elapsedTime) {
    //1. display the passed elapsed time as the elapsed time in the elapsedTime HTML element
    this.elapsedTimeTagTarget.innerHTML = elapsedTime;

    //2. Stop the recording when the max number of hours is reached
    if (this.elapsedTimeReachedMaximumNumberOfHours(elapsedTime)) {
        this.stopAudioRecording();
    }
  }

  elapsedTimeReachedMaximumNumberOfHours(elapsedTime) {
    //Split the elapsed time by the symbo :
    let elapsedTimeSplitted = elapsedTime.split(":");

    //Turn the maximum recording time in hours to a string and pad it with zero if less than 10
    let maximumRecordingTimeInHoursAsString = this.maximumRecordingTimeInHours < 10 ? "0" + this.maximumRecordingTimeInHours : this.maximumRecordingTimeInHours.toString();

    //if it the elapsed time reach hours and also reach the maximum recording time in hours return true
    if (elapsedTimeSplitted.length === 3 && elapsedTimeSplitted[0] === maximumRecordingTimeInHoursAsString)
        return true;
    else //otherwise, return false
        return false;
  }

  /** Computes the elapsedTime since the moment the function is called in the format mm:ss or hh:mm:ss
 * @param {String} startTime - start time to compute the elapsed time since
 * @returns {String} elapsed time in mm:ss format or hh:mm:ss format, if elapsed hours are 0.
 */
  computeElapsedTime(startTime) {
    //record end time
    let endTime = new Date();

    //time difference in ms
    let timeDiff = endTime - startTime;

    //convert time difference from ms to seconds
    timeDiff = timeDiff / 1000;

    //extract integer seconds that dont form a minute using %
    let seconds = Math.floor(timeDiff % 60); //ignoring uncomplete seconds (floor)

    //pad seconds with a zero if neccessary
    seconds = seconds < 10 ? "0" + seconds : seconds;

    //convert time difference from seconds to minutes using %
    timeDiff = Math.floor(timeDiff / 60);

    //extract integer minutes that don't form an hour using %
    let minutes = timeDiff % 60; //no need to floor possible incomplete minutes, becase they've been handled as seconds
    minutes = minutes < 10 ? "0" + minutes : minutes;

    //convert time difference from minutes to hours
    timeDiff = Math.floor(timeDiff / 60);

    //extract integer hours that don't form a day using %
    let hours = timeDiff % 24; //no need to floor possible incomplete hours, becase they've been handled as seconds

    //convert time difference from hours to days
    timeDiff = Math.floor(timeDiff / 24);

    // the rest of timeDiff is number of days
    let days = timeDiff; //add days to hours

    let totalHours = hours + (days * 24);
    totalHours = totalHours < 10 ? "0" + totalHours : totalHours;

    if (totalHours === "00") {
        return minutes + ":" + seconds;
    } else {
        return totalHours + ":" + minutes + ":" + seconds;
    }
  }
}

//   newRecord() {
//     this.voiceInstructionsTarget.classList.remove('hidden');
//     this.microphoneTarget.classList.add('invisible');
//     this.stopTarget.classList.remove('invisible');
//     this.audioRecordTarget.classList.remove('hidden');

//     this.createUserAudio();
//   }

//   stopRecord() {
//     const mediaStream = this.stream;
//     if (mediaStream && mediaStream.getTracks) {
//       mediaStream.getTracks().forEach(track => track.stop());
//     }

//     this.audioRecordTarget.classList.add('hidden');
//     this.playTarget.classList.remove('invisible');
//     this.voiceInstructionsTarget.classList.add('hidden');
//     this.iconsContainerTarget.classList.add('hidden');
//     this.playInstructionsTarget.classList.remove('hidden');
//   }

//   playRecord() {
//     const audioURL = URL.createObjectURL(this.recordedBlob);
//     const audio = new Audio(audioURL);
//     audio.play();
//   }

//   createUserAudio() {
//     navigator.mediaDevices.getUserMedia({ audio: true })
//       .then((stream) => {
//         this.stream = stream;
//         const audioContext = new AudioContext();
//         const source = audioContext.createMediaStreamSource(stream);
//         const analyser = audioContext.createAnalyser();
//         analyser.fftSize = 16384;
//         source.connect(analyser);
//         analyser.connect(audioContext.destination);
//         const bufferLength = analyser.fftSize;
//         const dataArray = new Uint8Array(bufferLength);

//         const draw = () => {
//           requestAnimationFrame(draw);
//           analyser.getByteTimeDomainData(dataArray);
//           const canvas = document.getElementById('waveCanvas');
//           const context = canvas.getContext('2d');
//           context.clearRect(0, 0, canvas.width, canvas.height);
//           context.lineWidth = 3;
//           context.strokeStyle = 'FFC300';
//           context.beginPath();
//           const sliceWidth = canvas.width * 1.0 / bufferLength;
//           let x = 0;
//           for (let i = 0; i < bufferLength; i++) {
//             const v = dataArray[i] / 128.0;
//             const y = v * canvas.height / 2;
//             if (i === 0) {
//               context.moveTo(x, y);
//             } else {
//               context.lineTo(x, y);
//             }
//             x += sliceWidth;
//           }
//           context.lineTo(canvas.width, canvas.height / 2);
//           context.stroke();
//         };

//         draw();
//         this.startRecording(stream);
//       })
//       .catch((error) => {
//         console.error('Erreur lors de l\'obtention de l\'audio :', error);
//       });
//   }

//   startRecording(stream) {
//     const mediaRecorder = new MediaRecorder(stream);
//     const chunks = [];

//     mediaRecorder.addEventListener('dataavailable', (event) => {
//       chunks.push(event.data);
//     });

//     mediaRecorder.addEventListener('stop', () => {
//       this.recordedBlob = new Blob(chunks, { type: 'audio/wav' });
//     });

//     mediaRecorder.start();
//     this.mediaRecorder = mediaRecorder;
//   }
// }
