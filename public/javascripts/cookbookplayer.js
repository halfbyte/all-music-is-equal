var Music = {notes: /* 0 */ [ 16.35,    17.32,    18.35,    19.45,    20.6,     21.83,    23.12,    24.5,     25.96,    27.5,  29.14,    30.87,
                             /* 1 */   32.7,     34.65,    36.71,    38.89,    41.2,     43.65,    46.25,    49,       51.91,    55,    58.27,    61.74,
                             /* 2 */   65.41,    69.3,     73.42,    77.78,    82.41,    87.31,    92.5,     98,       103.83,   110,   116.54,   123.47,
                             /* 3 */   130.81,   138.59,   146.83,   155.56,   164.81,   174.61,   185,      196,      207.65,   220,   233.08,   246.94,
                             /* 4 */   261.63,   277.18,   293.66,   311.13,   329.63,   349.23,   369.99,   392,      415.3,    440,   466.16,   493.88,
                             /* 5 */   523.25,   554.37,   587.33,   622.25,   659.26,   698.46,   739.99,   783.99,   830.61,   880,   932.33,   987.77,
                             /* 6 */   1046.5,   1108.73,  1174.66,  1244.51,  1318.51,  1396.91,  1479.98,  1567.98,  1661.22,  1760,  1864.66,  1975.53,
                             /* 7 */   2093,     2217.46,  2349.32,  2489.02,  2637.02,  2793.83,  2959.96,  3135.96,  3322.44,  3520,  3729.31,  3951.07,
                             /* 8 */   4186.01,  4434.92,  4698.64,  4978 ]
                           };

var currentSegment = -1;
var currentBeat = 0;
var beatStick = 0;
var lastSegmentTime = 0;
var lastNote = -1;
var BASEOCTAVE = 5;
var currentOctave = BASEOCTAVE;
var s;

function genSound(len, pos) {
  console.log("test:" + len + " pos: " + pos);
  var buffer = "";
  for(var i=0;i<len;i++) {
    var currentPos = pos + i;
    var currentPosInSeconds = currentPos / 44100;
    if ((currentSegment == -1) || (lastSegmentTime + patternData[currentSegment].duration < currentPosInSeconds)) {
      if (currentSegment != -1) {
        lastSegmentTime += patternData[currentSegment].duration;
        lastNote = patternData[currentSegment].pitches[0][1];
        var diff = patternData[currentSegment].pitches[0][1] - patternData[currentSegment + 1].pitches[0][1]
        if (Math.abs(diff) > 7) {
          currentOctave += diff / Math.abs(diff);
        } else {
          currentOctave = BASEOCTAVE;
        }
      }
      currentSegment++;
    }

    var freq;
    var period;
    var posInPeriod;
    var sound = 0;
    var pitchesLen = patternData[currentSegment].pitches.length;
    var dominantPitch = patternData[currentSegment].pitches[0][1];

    for(var p=0;p<pitchesLen;p++) {
      var diff = Math.abs(patternData[currentSegment].pitches[p][1] - dominantPitch);
      if (diff == 0 || diff > 2) {
        freq = Music.notes[(currentOctave * 12) + patternData[currentSegment].pitches[p][1]];
        period = 44100.0 / freq;
        posInPeriod = currentPos % period / period;
        sound += Math.sin(posInPeriod * 2 * Math.PI) * patternData[currentSegment].pitches[p][0];
      }
    }

    if (currentPosInSeconds > beatsData[currentBeat].start) {
      currentBeat++;
      beatStick = 200;
    }
    if (beatStick > 0) {
      sound += (Math.random()-0.5) * 1.2;
      beatStick--;
    }

    var word = Math.round((sound * 32768.0 * 0.2) + 32768.0);
    buffer += s.encodeHex(word);
  }
  return buffer;
}

$(function() {


  window.setTimeout(function() {
    s = SoundBridge('soundbridge');
    s.setCallback('genSound');
    var playing = false;
    $('#playButton').click(function(e) {
      if (playing) {
        s.stop();
        $(this).html("Play");
        playing = false;
      } else {
        s.play();
        $(this).html("Stop");
        playing = true;
      }
      return false;
    });
  }, 200);


})
