class Lesson < ApplicationRecord
  belongs_to :professor, class_name: "User", foreign_key: true
end
