class Vehicle < ApplicationRecord
  belongs_to :vehicle_size
  validates_presence_of :vehicle_size, :make, :model, :year, :vin
  validates :vin, length: {maximum: 17, minimum: 17}
end
