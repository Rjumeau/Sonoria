# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)

puts "Destroy users..."

User.destroy_all

teacher = User.create(firstname: "Manon",
                      lastname: "Gililacoste",
                      school: 'Les petits moutons',
                      role: 0,
                      email: "manon@sonoria.fr",
                      password: 'secrette')

student = User.create(firstname: "Romain",
                      lastname: "Jumeau",
                      school: 'Les petits moutons',
                      role: 1,
                      email: "romain@sonoria.fr",
                      password: 'secrette')
