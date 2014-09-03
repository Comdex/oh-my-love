class CreateInvitations < ActiveRecord::Migration
  def change
    create_table :invitations do |t|
      t.string :name
      t.string :phone
      t.string :gift
      t.string :hotel
      t.string :party
      t.text :note

      t.timestamps
    end
  end
end
