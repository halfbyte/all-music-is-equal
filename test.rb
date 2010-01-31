require 'rubygems'
require 'httparty'
require 'json'

API_KEY = "3CDDNAYCLXTBWNYLZ"

search_uri = "http://developer.echonest.com/api/alpha_search_tracks?api_key=#{API_KEY}&title=Firestarter&artist=Prodigy"
dings = JSON.parse(HTTParty.get(search_uri))
puts dings.inspect

track_id = dings['results'][0]['trackID'];

analyze = JSON.parse(HTTParty.get("http://developer.echonest.com/api/alpha_get_analysis?api_key=#{API_KEY}&trackID=#{track_id}"))

puts analyze.inspect



