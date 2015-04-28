import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Connection;


public class Business {
    
	private String businessid;
	private String name;
	private double latitude;
	private double longitude;
	private String address;
	private double rating;
	
	public Business(String businessid, String name, double lat, double longitude,
			String address, double rating) {
		this.businessid = businessid;
		this.name = name;
		this.latitude = lat;
		this.longitude = longitude;
		this.address = address;
		this.rating = rating;
	}
	
	public void print() {
		System.out.println("id: " + businessid);
		System.out.println("    name: " + name);
		System.out.println("    lat: " + latitude);
		System.out.println("    long: " + longitude);
		System.out.println("    addr: " + address);
		System.out.println("    rating: " + rating);
	}
	
	public void writeToDB(Connection conn) {
		try {
			String sql= "INSERT INTO Business VALUES(?,?,?,?,?,?)";
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, businessid);
			ps.setString(2, name);
			ps.setString(3, address);
			ps.setDouble(4, latitude);
			ps.setDouble(5, longitude);
			ps.setDouble(6, rating);
			ps.execute();
			ps.close();
    	} catch(SQLException se){
    		se.printStackTrace();
    	} 
	}
}