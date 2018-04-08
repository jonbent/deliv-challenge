class Vehicle < ApplicationRecord
  belongs_to :vehicle_size
  has_many :reviews
  
  validates_presence_of :vehicle_size, :make, :model, :year, :vin
  validates :vin, length: {maximum: 17, minimum: 17}
end
