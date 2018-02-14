filename=$(basename "$1")
extension="${filename##*.}"
filename="${filename%.*}"

if [ "$extension" = "mp4" ] || [ "$extension" = "webm" ] || [ "$extension" = "ogg" ]
then
	totem-video-thumbnailer -j "$1" thumbnails/"$filename".jpg
	ffprobe -v quiet -print_format json -show_format -show_streams "$1" | grep \"width\"
	ffprobe -v quiet -print_format json -show_format -show_streams "$1" | grep \"height\"
else
	convert "$1" -geometry x200 thumbnails/"$filename".jpg
	identify -format '%w|%h\n' "$1"
fi
