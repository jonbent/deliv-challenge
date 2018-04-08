class AddTrimToVehicle < ActiveRecord::Migration[5.1]
  def change
    add_column :vehicles, :trim, :string
  end
end
