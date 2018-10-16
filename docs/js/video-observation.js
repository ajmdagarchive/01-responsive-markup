(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

require('./modules/videos-observation/initVideo');

require('./modules/videos-observation/workWithVideos');

require('./modules/videos-observation/audioDetector');
},{"./modules/videos-observation/audioDetector":2,"./modules/videos-observation/initVideo":3,"./modules/videos-observation/workWithVideos":4}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
function initVideo(video, url) {
	if (Hls.isSupported()) {
		var hls = new Hls()
		hls.loadSource(url)
		hls.attachMedia(video)
		hls.on(Hls.Events.MANIFEST_PARSED, function() {
			video.play()
		})
	} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
		video.src = 'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8'
		video.addEventListener('loadedmetadata', function() {
			video.play()
		})
	}
}

initVideo(
	document.getElementById('video-1'),
	'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fsosed%2Fmaster.m3u8'
)

initVideo(
	document.getElementById('video-2'),
	'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fcat%2Fmaster.m3u8'
)

initVideo(
	document.getElementById('video-3'),
	'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fdog%2Fmaster.m3u8'
)

initVideo(
	document.getElementById('video-4'),
	'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fhall%2Fmaster.m3u8'
)

},{}],4:[function(require,module,exports){
const videoContainers = document.querySelectorAll('.videos-wrap__video-container')
const videos = document.querySelectorAll('.videos-wrap__video')

const timeForVideoToShow = 400

// Audio API settings
const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
const analysers = [audioCtx.createAnalyser(), audioCtx.createAnalyser(), audioCtx.createAnalyser(), audioCtx.createAnalyser()]
analysers[0].connect(audioCtx.destination)
analysers[1].connect(audioCtx.destination)
analysers[2].connect(audioCtx.destination)
analysers[3].connect(audioCtx.destination)

const source0 = audioCtx.createMediaElementSource(videos[0])
const source1 = audioCtx.createMediaElementSource(videos[1])
const source2 = audioCtx.createMediaElementSource(videos[2])
const source3 = audioCtx.createMediaElementSource(videos[3])
source0.connect(analysers[0])
source1.connect(analysers[1])
source2.connect(analysers[2])
source3.connect(analysers[3])

// Canvas settings
const canvas = document.querySelector('.visualizer')
const canvasCtx = canvas.getContext('2d')
const intendedWidth = document.querySelector('.videos-wrap__video-settings').clientWidth
canvas.setAttribute('width', intendedWidth)

const allCamerasButton = document.querySelector('.videos-wrap__video-all-cameras')
let isAllButtonClicked = false

// Visualize function
const visualize = (analyser) => {
	const WIDTH = canvas.width
	const HEIGHT = canvas.height

	analyser.fftSize = 256
	const bufferLengthAlt = analyser.frequencyBinCount
	const dataArrayAlt = new Uint8Array(bufferLengthAlt)

	canvasCtx.clearRect(0, 0, WIDTH, HEIGHT)

	const drawAlt = () => {
		requestAnimationFrame(drawAlt)

		analyser.getByteFrequencyData(dataArrayAlt)

		canvasCtx.fillStyle = 'rgb(0, 0, 0)'
		canvasCtx.fillRect(0, 0, WIDTH, HEIGHT)

		const barWidth = WIDTH / bufferLengthAlt
		let barHeight
		let x = 0

		for (let i = 0; i < bufferLengthAlt; i += 1) {
			barHeight = dataArrayAlt[i]

			canvasCtx.fillStyle = `rgb(${barHeight + 100},50,50)`
			canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2)

			x += barWidth + 1
			if (isAllButtonClicked) {
				canvasCtx.clearRect(0, 0, WIDTH, HEIGHT)
				cancelAnimationFrame(drawAlt)
			}
		}
	}

	drawAlt()
}

const main = (el, analyserIndex) => {
	visualize(analysers[analyserIndex])
}

const brightnessInput = document.querySelector('.videos-wrap__brightness-input')
const contrastInput = document.querySelector('.videos-wrap__contrast-input')
const videoSettingsPanel = document.querySelector('.videos-wrap__video-settings')

const videosSettings = []

const pageCenter = {
	top: document.documentElement.clientHeight / 2,
	left: document.documentElement.clientWidth / 2
}

const getCenterCoords = (el) => ({
	top: el.getBoundingClientRect().top + el.offsetHeight / 2,
	left: el.getBoundingClientRect().left + el.offsetWidth / 2
})

videoContainers.forEach((item, index) => {
	const video = item.querySelector('video')

	const videoInfo = {
		brightness: 1,
		contrast: 1
	}

	function defineFilters() {
		videosSettings[index].contrast = contrastInput.value / 20
		videosSettings[index].brightness = brightnessInput.value / 20
		item.style.filter = `brightness(${videosSettings[index].brightness}) contrast(${videosSettings[index].contrast})`
	}

	videosSettings.push(videoInfo)

	item.addEventListener('click', () => {
		const itemCenter = getCenterCoords(item)
		if (!item.classList.contains('videos-wrap__video-container--open')) {
			isAllButtonClicked = false

			video.muted = false

			item.style.transform = `translate(${-(itemCenter.left - pageCenter.left)}px, ${-(itemCenter.top - pageCenter.top)}px) scale(${document
				.documentElement.clientWidth / item.offsetWidth})`

			contrastInput.value = videosSettings[index].contrast * 20
			brightnessInput.value = videosSettings[index].brightness * 20

			item.classList.remove('videos-wrap__video-container--overflow-hidden')
			item.classList.add('videos-wrap__video-container--open')

			contrastInput.addEventListener('input', defineFilters)
			brightnessInput.addEventListener('input', defineFilters)
			videoSettingsPanel.classList.remove('videos-wrap__video-settings--hidden')
			setTimeout(() => {
				document.body.classList.add('video-open')
			}, timeForVideoToShow - 100)
			main(video, index)

			allCamerasButton.addEventListener('click', () => {
				isAllButtonClicked = true

				video.muted = true

				item.style.transform = 'none'

				videoSettingsPanel.classList.add('videos-wrap__video-settings--hidden')
				setTimeout(() => {
					item.classList.add('videos-wrap__video-container--overflow-hidden')
				}, timeForVideoToShow)

				contrastInput.removeEventListener('input', defineFilters)
				brightnessInput.removeEventListener('input', defineFilters)

				item.classList.remove('videos-wrap__video-container--open')
				document.body.classList.remove('video-open')
			})
		}
	})
})

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3l1cnkvcHJvamVjdHMvc2hyaS0yMDE4LzAxLXJlc3BvbnNpdmUtbWFya3VwL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS95dXJ5L3Byb2plY3RzL3NocmktMjAxOC8wMS1yZXNwb25zaXZlLW1hcmt1cC9zcmMvanMvZmFrZV8yNmFlMDg5Ny5qcyIsIi9ob21lL3l1cnkvcHJvamVjdHMvc2hyaS0yMDE4LzAxLXJlc3BvbnNpdmUtbWFya3VwL3NyYy9qcy9tb2R1bGVzL3ZpZGVvcy1vYnNlcnZhdGlvbi9hdWRpb0RldGVjdG9yLmpzIiwiL2hvbWUveXVyeS9wcm9qZWN0cy9zaHJpLTIwMTgvMDEtcmVzcG9uc2l2ZS1tYXJrdXAvc3JjL2pzL21vZHVsZXMvdmlkZW9zLW9ic2VydmF0aW9uL2luaXRWaWRlby5qcyIsIi9ob21lL3l1cnkvcHJvamVjdHMvc2hyaS0yMDE4LzAxLXJlc3BvbnNpdmUtbWFya3VwL3NyYy9qcy9tb2R1bGVzL3ZpZGVvcy1vYnNlcnZhdGlvbi93b3JrV2l0aFZpZGVvcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnLi9tb2R1bGVzL3ZpZGVvcy1vYnNlcnZhdGlvbi9pbml0VmlkZW8nKTtcblxucmVxdWlyZSgnLi9tb2R1bGVzL3ZpZGVvcy1vYnNlcnZhdGlvbi93b3JrV2l0aFZpZGVvcycpO1xuXG5yZXF1aXJlKCcuL21vZHVsZXMvdmlkZW9zLW9ic2VydmF0aW9uL2F1ZGlvRGV0ZWN0b3InKTsiLG51bGwsImZ1bmN0aW9uIGluaXRWaWRlbyh2aWRlbywgdXJsKSB7XG5cdGlmIChIbHMuaXNTdXBwb3J0ZWQoKSkge1xuXHRcdHZhciBobHMgPSBuZXcgSGxzKClcblx0XHRobHMubG9hZFNvdXJjZSh1cmwpXG5cdFx0aGxzLmF0dGFjaE1lZGlhKHZpZGVvKVxuXHRcdGhscy5vbihIbHMuRXZlbnRzLk1BTklGRVNUX1BBUlNFRCwgZnVuY3Rpb24oKSB7XG5cdFx0XHR2aWRlby5wbGF5KClcblx0XHR9KVxuXHR9IGVsc2UgaWYgKHZpZGVvLmNhblBsYXlUeXBlKCdhcHBsaWNhdGlvbi92bmQuYXBwbGUubXBlZ3VybCcpKSB7XG5cdFx0dmlkZW8uc3JjID0gJ2h0dHBzOi8vdmlkZW8tZGV2LmdpdGh1Yi5pby9zdHJlYW1zL3gzNnhoenoveDM2eGh6ei5tM3U4J1xuXHRcdHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWRlZG1ldGFkYXRhJywgZnVuY3Rpb24oKSB7XG5cdFx0XHR2aWRlby5wbGF5KClcblx0XHR9KVxuXHR9XG59XG5cbmluaXRWaWRlbyhcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZpZGVvLTEnKSxcblx0J2h0dHA6Ly9sb2NhbGhvc3Q6OTE5MS9tYXN0ZXI/dXJsPWh0dHAlM0ElMkYlMkZsb2NhbGhvc3QlM0EzMTAyJTJGc3RyZWFtcyUyRnNvc2VkJTJGbWFzdGVyLm0zdTgnXG4pXG5cbmluaXRWaWRlbyhcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZpZGVvLTInKSxcblx0J2h0dHA6Ly9sb2NhbGhvc3Q6OTE5MS9tYXN0ZXI/dXJsPWh0dHAlM0ElMkYlMkZsb2NhbGhvc3QlM0EzMTAyJTJGc3RyZWFtcyUyRmNhdCUyRm1hc3Rlci5tM3U4J1xuKVxuXG5pbml0VmlkZW8oXG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aWRlby0zJyksXG5cdCdodHRwOi8vbG9jYWxob3N0OjkxOTEvbWFzdGVyP3VybD1odHRwJTNBJTJGJTJGbG9jYWxob3N0JTNBMzEwMiUyRnN0cmVhbXMlMkZkb2clMkZtYXN0ZXIubTN1OCdcbilcblxuaW5pdFZpZGVvKFxuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlkZW8tNCcpLFxuXHQnaHR0cDovL2xvY2FsaG9zdDo5MTkxL21hc3Rlcj91cmw9aHR0cCUzQSUyRiUyRmxvY2FsaG9zdCUzQTMxMDIlMkZzdHJlYW1zJTJGaGFsbCUyRm1hc3Rlci5tM3U4J1xuKVxuIiwiY29uc3QgdmlkZW9Db250YWluZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnZpZGVvcy13cmFwX192aWRlby1jb250YWluZXInKVxuY29uc3QgdmlkZW9zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnZpZGVvcy13cmFwX192aWRlbycpXG5cbmNvbnN0IHRpbWVGb3JWaWRlb1RvU2hvdyA9IDQwMFxuXG4vLyBBdWRpbyBBUEkgc2V0dGluZ3NcbmNvbnN0IGF1ZGlvQ3R4ID0gbmV3ICh3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQpKClcbmNvbnN0IGFuYWx5c2VycyA9IFthdWRpb0N0eC5jcmVhdGVBbmFseXNlcigpLCBhdWRpb0N0eC5jcmVhdGVBbmFseXNlcigpLCBhdWRpb0N0eC5jcmVhdGVBbmFseXNlcigpLCBhdWRpb0N0eC5jcmVhdGVBbmFseXNlcigpXVxuYW5hbHlzZXJzWzBdLmNvbm5lY3QoYXVkaW9DdHguZGVzdGluYXRpb24pXG5hbmFseXNlcnNbMV0uY29ubmVjdChhdWRpb0N0eC5kZXN0aW5hdGlvbilcbmFuYWx5c2Vyc1syXS5jb25uZWN0KGF1ZGlvQ3R4LmRlc3RpbmF0aW9uKVxuYW5hbHlzZXJzWzNdLmNvbm5lY3QoYXVkaW9DdHguZGVzdGluYXRpb24pXG5cbmNvbnN0IHNvdXJjZTAgPSBhdWRpb0N0eC5jcmVhdGVNZWRpYUVsZW1lbnRTb3VyY2UodmlkZW9zWzBdKVxuY29uc3Qgc291cmNlMSA9IGF1ZGlvQ3R4LmNyZWF0ZU1lZGlhRWxlbWVudFNvdXJjZSh2aWRlb3NbMV0pXG5jb25zdCBzb3VyY2UyID0gYXVkaW9DdHguY3JlYXRlTWVkaWFFbGVtZW50U291cmNlKHZpZGVvc1syXSlcbmNvbnN0IHNvdXJjZTMgPSBhdWRpb0N0eC5jcmVhdGVNZWRpYUVsZW1lbnRTb3VyY2UodmlkZW9zWzNdKVxuc291cmNlMC5jb25uZWN0KGFuYWx5c2Vyc1swXSlcbnNvdXJjZTEuY29ubmVjdChhbmFseXNlcnNbMV0pXG5zb3VyY2UyLmNvbm5lY3QoYW5hbHlzZXJzWzJdKVxuc291cmNlMy5jb25uZWN0KGFuYWx5c2Vyc1szXSlcblxuLy8gQ2FudmFzIHNldHRpbmdzXG5jb25zdCBjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudmlzdWFsaXplcicpXG5jb25zdCBjYW52YXNDdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuY29uc3QgaW50ZW5kZWRXaWR0aCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy52aWRlb3Mtd3JhcF9fdmlkZW8tc2V0dGluZ3MnKS5jbGllbnRXaWR0aFxuY2FudmFzLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBpbnRlbmRlZFdpZHRoKVxuXG5jb25zdCBhbGxDYW1lcmFzQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnZpZGVvcy13cmFwX192aWRlby1hbGwtY2FtZXJhcycpXG5sZXQgaXNBbGxCdXR0b25DbGlja2VkID0gZmFsc2VcblxuLy8gVmlzdWFsaXplIGZ1bmN0aW9uXG5jb25zdCB2aXN1YWxpemUgPSAoYW5hbHlzZXIpID0+IHtcblx0Y29uc3QgV0lEVEggPSBjYW52YXMud2lkdGhcblx0Y29uc3QgSEVJR0hUID0gY2FudmFzLmhlaWdodFxuXG5cdGFuYWx5c2VyLmZmdFNpemUgPSAyNTZcblx0Y29uc3QgYnVmZmVyTGVuZ3RoQWx0ID0gYW5hbHlzZXIuZnJlcXVlbmN5QmluQ291bnRcblx0Y29uc3QgZGF0YUFycmF5QWx0ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyTGVuZ3RoQWx0KVxuXG5cdGNhbnZhc0N0eC5jbGVhclJlY3QoMCwgMCwgV0lEVEgsIEhFSUdIVClcblxuXHRjb25zdCBkcmF3QWx0ID0gKCkgPT4ge1xuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShkcmF3QWx0KVxuXG5cdFx0YW5hbHlzZXIuZ2V0Qnl0ZUZyZXF1ZW5jeURhdGEoZGF0YUFycmF5QWx0KVxuXG5cdFx0Y2FudmFzQ3R4LmZpbGxTdHlsZSA9ICdyZ2IoMCwgMCwgMCknXG5cdFx0Y2FudmFzQ3R4LmZpbGxSZWN0KDAsIDAsIFdJRFRILCBIRUlHSFQpXG5cblx0XHRjb25zdCBiYXJXaWR0aCA9IFdJRFRIIC8gYnVmZmVyTGVuZ3RoQWx0XG5cdFx0bGV0IGJhckhlaWdodFxuXHRcdGxldCB4ID0gMFxuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBidWZmZXJMZW5ndGhBbHQ7IGkgKz0gMSkge1xuXHRcdFx0YmFySGVpZ2h0ID0gZGF0YUFycmF5QWx0W2ldXG5cblx0XHRcdGNhbnZhc0N0eC5maWxsU3R5bGUgPSBgcmdiKCR7YmFySGVpZ2h0ICsgMTAwfSw1MCw1MClgXG5cdFx0XHRjYW52YXNDdHguZmlsbFJlY3QoeCwgSEVJR0hUIC0gYmFySGVpZ2h0IC8gMiwgYmFyV2lkdGgsIGJhckhlaWdodCAvIDIpXG5cblx0XHRcdHggKz0gYmFyV2lkdGggKyAxXG5cdFx0XHRpZiAoaXNBbGxCdXR0b25DbGlja2VkKSB7XG5cdFx0XHRcdGNhbnZhc0N0eC5jbGVhclJlY3QoMCwgMCwgV0lEVEgsIEhFSUdIVClcblx0XHRcdFx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUoZHJhd0FsdClcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRkcmF3QWx0KClcbn1cblxuY29uc3QgbWFpbiA9IChlbCwgYW5hbHlzZXJJbmRleCkgPT4ge1xuXHR2aXN1YWxpemUoYW5hbHlzZXJzW2FuYWx5c2VySW5kZXhdKVxufVxuXG5jb25zdCBicmlnaHRuZXNzSW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudmlkZW9zLXdyYXBfX2JyaWdodG5lc3MtaW5wdXQnKVxuY29uc3QgY29udHJhc3RJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy52aWRlb3Mtd3JhcF9fY29udHJhc3QtaW5wdXQnKVxuY29uc3QgdmlkZW9TZXR0aW5nc1BhbmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnZpZGVvcy13cmFwX192aWRlby1zZXR0aW5ncycpXG5cbmNvbnN0IHZpZGVvc1NldHRpbmdzID0gW11cblxuY29uc3QgcGFnZUNlbnRlciA9IHtcblx0dG9wOiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0IC8gMixcblx0bGVmdDogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIC8gMlxufVxuXG5jb25zdCBnZXRDZW50ZXJDb29yZHMgPSAoZWwpID0+ICh7XG5cdHRvcDogZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICsgZWwub2Zmc2V0SGVpZ2h0IC8gMixcblx0bGVmdDogZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCArIGVsLm9mZnNldFdpZHRoIC8gMlxufSlcblxudmlkZW9Db250YWluZXJzLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG5cdGNvbnN0IHZpZGVvID0gaXRlbS5xdWVyeVNlbGVjdG9yKCd2aWRlbycpXG5cblx0Y29uc3QgdmlkZW9JbmZvID0ge1xuXHRcdGJyaWdodG5lc3M6IDEsXG5cdFx0Y29udHJhc3Q6IDFcblx0fVxuXG5cdGZ1bmN0aW9uIGRlZmluZUZpbHRlcnMoKSB7XG5cdFx0dmlkZW9zU2V0dGluZ3NbaW5kZXhdLmNvbnRyYXN0ID0gY29udHJhc3RJbnB1dC52YWx1ZSAvIDIwXG5cdFx0dmlkZW9zU2V0dGluZ3NbaW5kZXhdLmJyaWdodG5lc3MgPSBicmlnaHRuZXNzSW5wdXQudmFsdWUgLyAyMFxuXHRcdGl0ZW0uc3R5bGUuZmlsdGVyID0gYGJyaWdodG5lc3MoJHt2aWRlb3NTZXR0aW5nc1tpbmRleF0uYnJpZ2h0bmVzc30pIGNvbnRyYXN0KCR7dmlkZW9zU2V0dGluZ3NbaW5kZXhdLmNvbnRyYXN0fSlgXG5cdH1cblxuXHR2aWRlb3NTZXR0aW5ncy5wdXNoKHZpZGVvSW5mbylcblxuXHRpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuXHRcdGNvbnN0IGl0ZW1DZW50ZXIgPSBnZXRDZW50ZXJDb29yZHMoaXRlbSlcblx0XHRpZiAoIWl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCd2aWRlb3Mtd3JhcF9fdmlkZW8tY29udGFpbmVyLS1vcGVuJykpIHtcblx0XHRcdGlzQWxsQnV0dG9uQ2xpY2tlZCA9IGZhbHNlXG5cblx0XHRcdHZpZGVvLm11dGVkID0gZmFsc2VcblxuXHRcdFx0aXRlbS5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7LShpdGVtQ2VudGVyLmxlZnQgLSBwYWdlQ2VudGVyLmxlZnQpfXB4LCAkey0oaXRlbUNlbnRlci50b3AgLSBwYWdlQ2VudGVyLnRvcCl9cHgpIHNjYWxlKCR7ZG9jdW1lbnRcblx0XHRcdFx0LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCAvIGl0ZW0ub2Zmc2V0V2lkdGh9KWBcblxuXHRcdFx0Y29udHJhc3RJbnB1dC52YWx1ZSA9IHZpZGVvc1NldHRpbmdzW2luZGV4XS5jb250cmFzdCAqIDIwXG5cdFx0XHRicmlnaHRuZXNzSW5wdXQudmFsdWUgPSB2aWRlb3NTZXR0aW5nc1tpbmRleF0uYnJpZ2h0bmVzcyAqIDIwXG5cblx0XHRcdGl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgndmlkZW9zLXdyYXBfX3ZpZGVvLWNvbnRhaW5lci0tb3ZlcmZsb3ctaGlkZGVuJylcblx0XHRcdGl0ZW0uY2xhc3NMaXN0LmFkZCgndmlkZW9zLXdyYXBfX3ZpZGVvLWNvbnRhaW5lci0tb3BlbicpXG5cblx0XHRcdGNvbnRyYXN0SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBkZWZpbmVGaWx0ZXJzKVxuXHRcdFx0YnJpZ2h0bmVzc0lucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZGVmaW5lRmlsdGVycylcblx0XHRcdHZpZGVvU2V0dGluZ3NQYW5lbC5jbGFzc0xpc3QucmVtb3ZlKCd2aWRlb3Mtd3JhcF9fdmlkZW8tc2V0dGluZ3MtLWhpZGRlbicpXG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCd2aWRlby1vcGVuJylcblx0XHRcdH0sIHRpbWVGb3JWaWRlb1RvU2hvdyAtIDEwMClcblx0XHRcdG1haW4odmlkZW8sIGluZGV4KVxuXG5cdFx0XHRhbGxDYW1lcmFzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuXHRcdFx0XHRpc0FsbEJ1dHRvbkNsaWNrZWQgPSB0cnVlXG5cblx0XHRcdFx0dmlkZW8ubXV0ZWQgPSB0cnVlXG5cblx0XHRcdFx0aXRlbS5zdHlsZS50cmFuc2Zvcm0gPSAnbm9uZSdcblxuXHRcdFx0XHR2aWRlb1NldHRpbmdzUGFuZWwuY2xhc3NMaXN0LmFkZCgndmlkZW9zLXdyYXBfX3ZpZGVvLXNldHRpbmdzLS1oaWRkZW4nKVxuXHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHRpdGVtLmNsYXNzTGlzdC5hZGQoJ3ZpZGVvcy13cmFwX192aWRlby1jb250YWluZXItLW92ZXJmbG93LWhpZGRlbicpXG5cdFx0XHRcdH0sIHRpbWVGb3JWaWRlb1RvU2hvdylcblxuXHRcdFx0XHRjb250cmFzdElucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZGVmaW5lRmlsdGVycylcblx0XHRcdFx0YnJpZ2h0bmVzc0lucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZGVmaW5lRmlsdGVycylcblxuXHRcdFx0XHRpdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ3ZpZGVvcy13cmFwX192aWRlby1jb250YWluZXItLW9wZW4nKVxuXHRcdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3ZpZGVvLW9wZW4nKVxuXHRcdFx0fSlcblx0XHR9XG5cdH0pXG59KVxuIl19