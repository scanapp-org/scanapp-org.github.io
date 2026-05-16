source "https://rubygems.org"

# Jekyll 4.3+ is compatible with Ruby 3.x
gem "jekyll", "~> 4.3"
gem "minima", "~> 2.5"

# Required since Ruby 3.0 removed webrick from stdlib
gem "webrick", "~> 1.8"

group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
  gem "jekyll-paginate"
end

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
install_if -> { RUBY_PLATFORM =~ %r!mingw|mswin|java! } do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", :install_if => Gem.win_platform?
