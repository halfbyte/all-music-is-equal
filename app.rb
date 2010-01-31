require 'rubygems'
require 'httparty'
require 'json'
require 'sinatra'
require 'haml'

CACHE_DIR = File.join(File.dirname(__FILE__), 'cache')

class Echonest
  API_KEY = "3CDDNAYCLXTBWNYLZ"
  include HTTParty
  default_params({ :api_key => API_KEY })
  base_uri "http://developer.echonest.com/api"

  def self.search_tracks(artist, title)
    result = get("/alpha_search_tracks", :query => {:title => title, :artist => artist})
    puts result.inspect
    return JSON.parse(result)['results']
  end

  def self.get_analysis(track_id)
    cache_file = File.join(CACHE_DIR, "#{track_id}.json")
    if File.exists?(cache_file)
      return JSON.parse(open(cache_file, 'r').read)
    else
      result = get("/alpha_get_analysis", :query => {:trackID => track_id})
      if result
        File.open(cache_file, 'w') do |file|
          file.write(result)
        end
        return JSON.parse(result)
      end
      return nil
    end
  end

  def self.make_patterns(analysis)
    notes = analysis['segments'].map do |segment|
      pitches = segment['pitches']
      sorted_volumes = pitches.sort.reverse
      sorted_volumes.each do |v|
        dom_i = pitches.index(v)
        if (dom_i)
          ((dom_i + 1)..(dom_i+2)).each{|i| pitches[i % 12] = 0 if pitches[i]}
          ((dom_i-2)..(dom_i-1)).each{|i| pitches[i] = 0 if pitches[i]}
        end
      end
      i = -1
      sorted = segment['pitches'].map{|dom| i+=1 ; [dom, i] }.sort{|a, b| b.first <=> a.first }

      {:duration => segment['duration'], :pitches => sorted, :start => segment['start'] }
    end
    notes
  end

  def self.make_beats(analysis)
    analysis['beats']
  end

end

get '/' do
  haml :index
end

get '/search' do
  @matches = Echonest.search_tracks(params[:artist], params[:title])
  haml :search
end

get '/amiefy/:track_id' do
  @analysis = Echonest.get_analysis(params[:track_id])
  @patterns = Echonest.make_patterns(@analysis['analysis'])
  @beats = Echonest.make_beats(@analysis['analysis'])
  haml :amiefy
end