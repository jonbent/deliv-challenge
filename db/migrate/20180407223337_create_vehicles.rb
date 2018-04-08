class CreateVehicles < ActiveRecord::Migration[5.1]
  def change
    create_table :vehicles do |t|
      t.references :vehicle_size, foreign_key: true
      t.integer :year
      t.string :make
      t.string :model
      t.string :vin

      t.timestamps
    end
  end
end
