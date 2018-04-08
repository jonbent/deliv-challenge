class CreateReviews < ActiveRecord::Migration[5.1]
  def change
    create_table :reviews do |t|
      t.references :vehicle, foreign_key: true
      t.string :email
      t.float :rating
      t.string :comment

      t.timestamps
    end
  end
end
