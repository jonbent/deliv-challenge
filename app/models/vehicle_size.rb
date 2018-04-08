class VehicleSize < ApplicationRecord
    has_many :vehicles

    validates :name, uniqueness: true
    validates :name, presence: true
end
